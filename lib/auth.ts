import { User } from "@/app/generated/prisma";
import prisma from "./prisma";

export const getUserIdFromSession = async () => {
  // In a real app, this would use your auth provider's library
  // e.g., const { auth } = await import("@/auth");
  // const session = await auth();
  // return session?.user?.id;

  // For now, we will return a hardcoded user ID for testing purposes.
  // return undefined;
  return "cmcut7m320000vdhsdddjah6h";
};

/**
 * Checks if the current user is an admin. Throws an error if not.
 */
export async function ensureAdmin(): Promise<User> {
    const userId = await getUserIdFromSession();

    if (!userId) {
        throw new Error("User not authenticated.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Access is restricted to administrators.");
  }
  return user;
}