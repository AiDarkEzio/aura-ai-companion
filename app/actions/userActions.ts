// app/actions/userActions.ts
"use server";

import prisma from "@/lib/prisma";
import { patchBodySchema } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { UserData, UserUpdatePayload } from "@/lib/types";
import { PlanType } from "@/app/generated/prisma";
import { getUserIdFromSession } from "@/lib/auth";

/**
 * Server Action to retrieve all user data for the settings modal.
 * @returns {Promise<UserData | { error: string }>} A formatted user data object or an error object.
 */
export async function getUserData(): Promise<UserData | { error: string }> {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const userDataFromDb = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        persona: true,
        preferences: true,
        subscription: true,
      },
    });

    if (!userDataFromDb) {
      return { error: "User not found" };
    }

    // Reshape the data to match the structure expected by the frontend.
    const formattedUserData: UserData = {
      profile: {
        fullName: userDataFromDb.profile?.fullName ?? "",
        preferredName: userDataFromDb.profile?.preferredName ?? "",
        username: userDataFromDb.username ?? "",
        bio: userDataFromDb.profile?.bio ?? "",
        pronouns: userDataFromDb.profile?.pronouns ?? "",
      },
      account: {
        userId: userDataFromDb.id,
        email: userDataFromDb.email ?? "",
        dateJoined: userDataFromDb.createdAt.toISOString(),
        accountStatus: userDataFromDb.profile?.accountStatus ?? 'ACTIVE',
      },
      persona: {
        aiTone: userDataFromDb.persona?.aiTone ?? "",
        interests: userDataFromDb.persona?.interests ?? "",
        userGoals: userDataFromDb.persona?.userGoals ?? "",
        communicationStyle: userDataFromDb.persona?.communicationStyle ?? "",
        excludedTopics: userDataFromDb.persona?.excludedTopics ?? "",
      },
      preferences: {
        // theme: userDataFromDb.preferences?.theme ?? "SYSTEM",
        language: userDataFromDb.preferences?.language ?? 'en-us',
        timezone: userDataFromDb.preferences?.timezone ?? "",
        company: userDataFromDb.preferences?.company ?? "",
      },
      subscription: {
        currentPlan: userDataFromDb.subscription?.currentPlan ?? PlanType.FREE,
        nextBillingDate: userDataFromDb.subscription?.nextBillingDate?.toISOString() ?? "",
        paymentMethod: userDataFromDb.subscription?.paymentMethod ?? "",
        paymentMethodLast4: userDataFromDb.subscription?.paymentMethodLast4 ?? "",
      },
    };

    return formattedUserData;
  } catch (error) {
    console.error("Error reading user data:", error);
    return { error: "Error reading user data" };
  }
}

/**
 * Server Action to update user data.
 * @param {UserUpdatePayload} payload The data to update.
 * @returns {Promise<{ success: boolean; error?: string }>} A success or error response.
 */
export async function updateUserData(payload: UserUpdatePayload) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error(
      "Unauthorized: You must be logged in to perform this action."
    );
  }

  const validation = await patchBodySchema.safeParseAsync(payload);
  if (!validation.success) {
    // This will be caught by the client and shown in the toast.
    console.error("Zod Validation Error:", validation.error.flatten());
    throw new Error("Invalid data provided. Please check your input.");
  }

  const { profile, persona, preferences } = validation.data;

  try {
    await prisma.$transaction(async (tx) => {
      if (profile) {
        await tx.profile.upsert({
          where: { userId },
          create: {
            userId,
            fullName: profile.fullName,
            preferredName: profile.preferredName,
            bio: profile.bio,
            pronouns: profile.pronouns,
          },
          update: {
            fullName: profile.fullName,
            preferredName: profile.preferredName,
            bio: profile.bio,
            pronouns: profile.pronouns,
          },
        });
      }

      if (persona) {
        await tx.userPersona.upsert({
          where: { userId },
          create: { ...persona, userId },
          update: persona,
        });
      }

      if (preferences) {
        await tx.preferences.upsert({
          where: { userId },
          create: { ...preferences, userId },
          update: preferences,
        });
      }
    });

    // Invalidate cached data on relevant pages.
    // Use this if you display user settings on other pages like a dashboard.
    // revalidatePath("/app");
    revalidatePath("/(app)/app", 'layout');

    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    // Re-throwing the error allows the client's `toast.promise` to catch it.
    throw new Error("An unexpected error occurred while saving your settings.");
  }
}
