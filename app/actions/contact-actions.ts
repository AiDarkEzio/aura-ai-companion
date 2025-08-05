// app/actions/contact-actions.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth";

const ContactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

export type ContactFormState = {
  message?: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  success?: boolean;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
      success: false,
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    const userId = await getUserIdFromSession()

    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        userId,
      },
    });

    return {
      message:
        "Thank you! We've received your message and will be in touch soon.",
      success: true,
    };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return {
      message: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
