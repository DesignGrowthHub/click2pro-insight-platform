import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/server/utils";

import { getUserByEmail } from "./users";

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

type PasswordResetValidation =
  | {
      ok: true;
      email: string;
      expiresAt: string;
    }
  | {
      ok: false;
      reason: "missing" | "invalid" | "expired" | "used";
    };

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildResetTokenValue() {
  return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("base64url");
}

async function pruneExpiredPasswordResetTokens() {
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: new Date()
          }
        },
        {
          usedAt: {
            not: null
          }
        }
      ]
    }
  });
}

export async function issuePasswordResetEmail(input: {
  email: string;
  origin: string;
  callbackUrl?: string | null;
}) {
  await pruneExpiredPasswordResetTokens();

  const normalizedEmail = normalizeEmail(input.email);
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    return {
      ok: true as const,
      delivery: "silent" as const
    };
  }

  const resetToken = buildResetTokenValue();
  const tokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        userId: user.id
      }
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash,
        expiresAt
      }
    });
  });

  await sendPasswordResetEmail({
    to: user.email,
    fullName: user.fullName,
    resetToken,
    expiresAt,
    origin: input.origin,
    callbackUrl: input.callbackUrl ?? null
  });

  return {
    ok: true as const,
    delivery: "sent" as const
  };
}

export async function validatePasswordResetToken(
  resetToken: string | null | undefined
): Promise<PasswordResetValidation> {
  if (!resetToken || resetToken.trim().length === 0) {
    return {
      ok: false,
      reason: "missing"
    };
  }

  await pruneExpiredPasswordResetTokens();

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashResetToken(resetToken)
    }
  });

  if (!tokenRecord) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  if (tokenRecord.usedAt) {
    return {
      ok: false,
      reason: "used"
    };
  }

  if (tokenRecord.expiresAt <= new Date()) {
    return {
      ok: false,
      reason: "expired"
    };
  }

  return {
    ok: true,
    email: tokenRecord.email,
    expiresAt: tokenRecord.expiresAt.toISOString()
  };
}

export async function resetPasswordFromToken(input: {
  token: string;
  password: string;
}) {
  await pruneExpiredPasswordResetTokens();

  const tokenHash = hashResetToken(input.token);
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash
    }
  });

  if (!tokenRecord) {
    throw new Error("This reset link is not valid anymore.");
  }

  if (tokenRecord.usedAt) {
    throw new Error("This reset link has already been used.");
  }

  if (tokenRecord.expiresAt <= new Date()) {
    throw new Error("This reset link has expired. Request a new one.");
  }

  const passwordHash = await hashPassword(input.password);
  const claimedAt = new Date();

  await prisma.$transaction(async (tx) => {
    const claimedToken = await tx.passwordResetToken.updateMany({
      where: {
        id: tokenRecord.id,
        usedAt: null,
        expiresAt: {
          gt: claimedAt
        }
      },
      data: {
        usedAt: claimedAt
      }
    });

    if (claimedToken.count !== 1) {
      throw new Error("This reset link is not valid anymore.");
    }

    await tx.user.update({
      where: {
        id: tokenRecord.userId
      },
      data: {
        passwordHash
      }
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: tokenRecord.userId,
        id: {
          not: tokenRecord.id
        },
        usedAt: null
      },
      data: {
        usedAt: claimedAt
      }
    });
  });

  return {
    ok: true as const,
    email: tokenRecord.email
  };
}
