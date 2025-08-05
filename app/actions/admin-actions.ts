// app/actions/admin-actions.ts

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ContactStatus, Prisma } from "@/app/generated/prisma";
import { z } from "zod";
import { ensureAdmin } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contactSubmissionWithUser =
  Prisma.validator<Prisma.ContactSubmissionDefaultArgs>()({
    include: { user: { select: { name: true, email: true } } },
  });
export type ContactSubmissionWithUser = Prisma.ContactSubmissionGetPayload<
  typeof contactSubmissionWithUser
>;

/**
 * Fetches all contact submissions. Restricted to ADMIN users.
 */
export async function getContactSubmissions(): Promise<
  ContactSubmissionWithUser[]
> {
  await ensureAdmin();
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return submissions;
  } catch (error) {
    console.error("Failed to fetch contact submissions:", error);
    // In a real app, you might want more robust logging or error reporting
    throw new Error("Could not retrieve contact submissions.");
  }
}

const UpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(ContactStatus),
});

/**
 * Updates the status of a specific contact submission. Restricted to ADMIN users.
 * @param formData - The form data containing the submission ID and new status.
 */
export async function updateContactStatus(
  id: string,
  status: ContactStatus
): Promise<{ success: boolean; message: string }> {
  await ensureAdmin();

  const validation = UpdateStatusSchema.safeParse({ id, status });

  if (!validation.success) {
    return { success: false, message: "Invalid input." };
  }

  try {
    await prisma.contactSubmission.update({
      where: {
        id: validation.data.id,
      },
      data: {
        status: validation.data.status,
      },
    });

    revalidatePath("/admin/contacts");
    return { success: true, message: "Status updated successfully." };
  } catch (error) {
    console.error("Failed to update contact status:", error);
    return {
      success: false,
      message: "An error occurred while updating the status.",
    };
  }
}
