import { z } from "zod";
import { Theme } from "@/app/generated/prisma";

// --- ZOD SCHEMAS FOR VALIDATION ---
/**
 * Validates the `profile` object for an update.
 * All fields are optional since the payload is a Partial update.
 * Corresponds to `Partial<UserData["profile"]>`.
 */
const profileSchema = z
  .object({
    fullName: z.string().optional(),
    preferredName: z.string().optional(),
    username: z.string().optional(),
    bio: z.string().optional(),
    pronouns: z.string().optional(),
  })
  .strict();

/**
 * Validates the `persona` object for an update.
 * All fields are optional since the payload is a Partial update.
 * Corresponds to `Partial<UserData["persona"]>`.
 */
const personaSchema = z
  .object({
    aiTone: z.string().optional(),
    interests: z.string().optional(),
    userGoals: z.string().optional(),
    communicationStyle: z.string().optional(),
    excludedTopics: z.string().optional(),
  })
  .strict();

/**
 * Validates the `preferences` object for an update.
 * All fields are optional since the payload is a Partial update.
 * Corresponds to `Partial<UserData["preferences"]>`.
 */
const preferencesSchema = z
  .object({
    theme: z.nativeEnum(Theme).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    company: z.string().optional(),
  })
  .strict();

/**
 * The main validation schema for the user update API endpoint.
 * Corresponds to the `UserUpdatePayload` type.
 * It expects an object that can contain any combination of `profile`,
 * `persona`, or `preferences` objects, each with partial data.
 */
export const patchBodySchema = z
  .object({
    profile: profileSchema.optional(),
    persona: personaSchema.optional(),
    preferences: preferencesSchema.optional(),
  })
  .strict()
  // Ensure that the request body is not empty
  .refine((data) => Object.keys(data).length > 0, {
    message: "Request body cannot be empty.",
  })
  // Ensure that at least one of the nested objects is not empty
  .refine(
    (data) =>
      (data.profile && Object.keys(data.profile).length > 0) ||
      (data.persona && Object.keys(data.persona).length > 0) ||
      (data.preferences && Object.keys(data.preferences).length > 0),
    { message: "At least one field to update must be provided." }
  );

/**
 * Validates the `feedback` object for storing and deconstructing feedback data.
 * Corresponds to the structure used in the database.
 */
export const feedbackSchema = z.object({
  tags: z.array(z.string()),
  details: z.string(),
});

