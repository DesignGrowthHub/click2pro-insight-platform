import { cache } from "react";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { getUserById, sanitizeUser } from "@/lib/server/services/users";

export const getAuthSession = cache(() => getServerSession(authOptions));

export async function getCurrentUser() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);

  return user ? sanitizeUser(user) : null;
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication is required for this action.");
  }

  return user;
}
