import "server-only";

import { randomUUID } from "node:crypto";

import type { PaymentProvider, User } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail, normalizeNullableString } from "@/lib/server/utils";

export type SafeUser = Pick<
  User,
  | "id"
  | "email"
  | "fullName"
  | "preferredName"
  | "ageRange"
  | "country"
  | "region"
  | "occupationOrLifeStage"
  | "primaryConcern"
  | "profileCompleted"
  | "profileCompletedAt"
  | "profileSkippedAt"
  | "currency"
  | "preferredPaymentProvider"
  | "createdAt"
  | "updatedAt"
>;

export type CreateUserInput = {
  email: string;
  password: string;
  fullName?: string | null;
  country?: string | null;
  region?: string | null;
  currency?: string | null;
  preferredPaymentProvider?: PaymentProvider | null;
};

export type UpdateUserProfileInput = {
  fullName?: string | null;
  preferredName?: string | null;
  ageRange?: string | null;
  country?: string | null;
  region?: string | null;
  occupationOrLifeStage?: string | null;
  primaryConcern?: string | null;
};

export type CheckoutUserResolution = {
  user: SafeUser;
  origin: "existing" | "provisional";
};

const GUEST_CHECKOUT_EMAIL_DOMAIN = "checkout.local";

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    preferredName: user.preferredName,
    ageRange: user.ageRange,
    country: user.country,
    region: user.region,
    occupationOrLifeStage: user.occupationOrLifeStage,
    primaryConcern: user.primaryConcern,
    profileCompleted: user.profileCompleted,
    profileCompletedAt: user.profileCompletedAt,
    profileSkippedAt: user.profileSkippedAt,
    currency: user.currency,
    preferredPaymentProvider: user.preferredPaymentProvider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email)
    }
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function createUser(input: CreateUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      fullName: normalizeNullableString(input.fullName),
      country: normalizeNullableString(input.country),
      region: normalizeNullableString(input.region),
      profileCompleted: false,
      profileCompletedAt: null,
      profileSkippedAt: null,
      currency: normalizeNullableString(input.currency) ?? "USD",
      preferredPaymentProvider: input.preferredPaymentProvider ?? null
    }
  });

  return toSafeUser(user);
}

export function sanitizeUser(user: User): SafeUser {
  return toSafeUser(user);
}

export async function resolveCheckoutUserByEmail(input: {
  email: string;
  country?: string | null;
  region?: string | null;
  currency?: string | null;
  preferredPaymentProvider?: PaymentProvider | null;
}): Promise<CheckoutUserResolution> {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      user: toSafeUser(existingUser),
      origin: "existing"
    };
  }

  const passwordHash = await hashPassword(
    `${randomUUID()}-${randomUUID()}-checkout`
  );
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      country: normalizeNullableString(input.country),
      region: normalizeNullableString(input.region),
      profileCompleted: false,
      profileCompletedAt: null,
      profileSkippedAt: null,
      currency: normalizeNullableString(input.currency) ?? "USD",
      preferredPaymentProvider: input.preferredPaymentProvider ?? null
    }
  });

  return {
    user: toSafeUser(user),
    origin: "provisional"
  };
}

export function isGuestCheckoutPlaceholderEmail(value: string | null | undefined) {
  return Boolean(value && normalizeEmail(value).endsWith(`@${GUEST_CHECKOUT_EMAIL_DOMAIN}`));
}

export async function createGuestCheckoutUser(input: {
  country?: string | null;
  region?: string | null;
  currency?: string | null;
  preferredPaymentProvider?: PaymentProvider | null;
}): Promise<CheckoutUserResolution> {
  const passwordHash = await hashPassword(
    `${randomUUID()}-${randomUUID()}-guest-checkout`
  );
  const user = await prisma.user.create({
    data: {
      email: `guest-${randomUUID()}@${GUEST_CHECKOUT_EMAIL_DOMAIN}`,
      passwordHash,
      country: normalizeNullableString(input.country),
      region: normalizeNullableString(input.region),
      profileCompleted: false,
      profileCompletedAt: null,
      profileSkippedAt: null,
      currency: normalizeNullableString(input.currency) ?? "USD",
      preferredPaymentProvider: input.preferredPaymentProvider ?? null
    }
  });

  return {
    user: toSafeUser(user),
    origin: "provisional"
  };
}

export async function resolveGoogleAuthUser(input: {
  email: string;
  fullName?: string | null;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    const needsUpdate =
      (!existingUser.fullName && normalizeNullableString(input.fullName)) ||
      !existingUser.emailVerifiedAt;

    if (!needsUpdate) {
      return toSafeUser(existingUser);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id
      },
      data: {
        fullName: normalizeNullableString(input.fullName) ?? existingUser.fullName,
        emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date()
      }
    });

    return toSafeUser(updatedUser);
  }

  const passwordHash = await hashPassword(
    `${randomUUID()}-${randomUUID()}-google-auth`
  );
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      fullName: normalizeNullableString(input.fullName),
      profileCompleted: false,
      profileCompletedAt: null,
      profileSkippedAt: null,
      currency: "USD",
      emailVerifiedAt: new Date()
    }
  });

  return toSafeUser(user);
}

export async function resolvePaidCheckoutUser(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const currentUser = await getUserById(input.userId);

  if (!currentUser) {
    return null;
  }

  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser && existingUser.id !== currentUser.id) {
    return {
      user: toSafeUser(existingUser),
      origin: "existing" as const
    };
  }

  if (
    currentUser.email === normalizedEmail &&
    (!input.fullName || currentUser.fullName === normalizeNullableString(input.fullName))
  ) {
    return {
      user: toSafeUser(currentUser),
      origin: "provisional" as const
    };
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: currentUser.id
    },
    data: {
      email:
        currentUser.email === normalizedEmail ||
        isGuestCheckoutPlaceholderEmail(currentUser.email)
          ? normalizedEmail
          : undefined,
      fullName: normalizeNullableString(input.fullName) ?? currentUser.fullName
    }
  });

  return {
    user: toSafeUser(updatedUser),
    origin: "provisional" as const
  };
}

export async function claimCheckoutUserAccount(input: {
  userId: string;
  email: string;
  password: string;
  fullName?: string | null;
}) {
  const user = await getUserById(input.userId);
  const normalizedEmail = normalizeEmail(input.email);

  if (
    !user ||
    (user.email !== normalizedEmail && !isGuestCheckoutPlaceholderEmail(user.email))
  ) {
    return null;
  }

  const passwordHash = await hashPassword(input.password);
  const updatedUser = await prisma.user.update({
    where: {
      id: input.userId
    },
    data: {
      passwordHash,
      email: normalizedEmail,
      fullName: normalizeNullableString(input.fullName) ?? user.fullName,
      emailVerifiedAt: user.emailVerifiedAt ?? new Date()
    }
  });

  return toSafeUser(updatedUser);
}

export function getUserDisplayName(user: Pick<SafeUser, "preferredName" | "fullName" | "email">) {
  return (
    normalizeNullableString(user.preferredName) ??
    normalizeNullableString(user.fullName) ??
    user.email
  );
}

export function profileNeedsCompletion(user: Pick<SafeUser, "profileCompleted" | "profileSkippedAt">) {
  return !user.profileCompleted && !user.profileSkippedAt;
}

export async function completeUserProfile(input: {
  userId: string;
  profile: UpdateUserProfileInput;
}) {
  const currentUser = await getUserById(input.userId);

  if (!currentUser) {
    throw new Error("The account could not be found.");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: input.userId
    },
    data: {
      fullName:
        normalizeNullableString(input.profile.fullName) ?? currentUser.fullName,
      preferredName:
        normalizeNullableString(input.profile.preferredName) ?? currentUser.preferredName,
      ageRange: normalizeNullableString(input.profile.ageRange) ?? currentUser.ageRange,
      country: normalizeNullableString(input.profile.country) ?? currentUser.country,
      region: normalizeNullableString(input.profile.region) ?? currentUser.region,
      occupationOrLifeStage:
        normalizeNullableString(input.profile.occupationOrLifeStage) ??
        currentUser.occupationOrLifeStage,
      primaryConcern:
        normalizeNullableString(input.profile.primaryConcern) ??
        currentUser.primaryConcern,
      profileCompleted: true,
      profileCompletedAt: new Date(),
      profileSkippedAt: null
    }
  });

  return toSafeUser(updatedUser);
}

export async function skipUserProfile(userId: string) {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      profileCompleted: false,
      profileSkippedAt: new Date()
    }
  });

  return toSafeUser(updatedUser);
}
