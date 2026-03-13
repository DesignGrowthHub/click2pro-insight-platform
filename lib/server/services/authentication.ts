import "server-only";

import type { PaymentProvider } from "@prisma/client";

import { verifyPassword } from "@/lib/auth/password";
import { getUserByEmail, sanitizeUser } from "@/lib/server/services/users";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string | null;
  country: string | null;
  region: string | null;
  currency: string | null;
  preferredPaymentProvider: PaymentProvider | null;
};

export async function authenticateUserWithPassword(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  const safeUser = sanitizeUser(user);

  return {
    id: safeUser.id,
    email: safeUser.email,
    fullName: safeUser.fullName,
    country: safeUser.country,
    region: safeUser.region,
    currency: safeUser.currency,
    preferredPaymentProvider: safeUser.preferredPaymentProvider ?? null
  } satisfies AuthenticatedUser;
}
