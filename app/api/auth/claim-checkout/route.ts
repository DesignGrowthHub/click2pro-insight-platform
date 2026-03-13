import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCheckoutIntentById } from "@/lib/server/services/checkout-intents";
import {
  claimCheckoutUserAccount,
  isGuestCheckoutPlaceholderEmail
} from "@/lib/server/services/users";
import { normalizeEmail } from "@/lib/server/utils";

function parseCheckoutClaimState(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return {
      checkoutEmail: null as string | null,
      checkoutUserOrigin: null as "authenticated" | "existing" | "provisional" | null,
      alreadyClaimed: false
    };
  }

  const record = metadata as Record<string, unknown>;
  const checkoutUserOrigin =
    record.checkoutUserOrigin === "authenticated" ||
    record.checkoutUserOrigin === "existing" ||
    record.checkoutUserOrigin === "provisional"
      ? record.checkoutUserOrigin
      : null;

  return {
    checkoutEmail:
      typeof record.checkoutEmail === "string" ? record.checkoutEmail : null,
    checkoutUserOrigin,
    alreadyClaimed:
      typeof record.checkoutUserClaimedAt === "string" &&
      record.checkoutUserClaimedAt.length > 0
  };
}

function badRequest(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message
    },
    {
      status
    }
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    intentId?: string;
    email?: string;
    password?: string;
    fullName?: string;
  };

  const intentId = body.intentId?.trim();
  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!intentId) {
    return badRequest("Checkout intent is required.");
  }

  if (!email) {
    return badRequest("Email is required.");
  }

  if (!password || password.length < 8) {
    return badRequest("Password must be at least 8 characters.");
  }

  const existingIntent = await getCheckoutIntentById(intentId);

  if (!existingIntent) {
    return badRequest("Checkout intent could not be found.", 404);
  }

  if (!existingIntent.purchase && existingIntent.status !== "PAID") {
    return badRequest("Payment must be confirmed before access can be claimed.", 409);
  }

  const claimState = parseCheckoutClaimState(existingIntent.metadata);
  const normalizedEmail = normalizeEmail(email);
  const checkoutEmail =
    claimState.checkoutEmail ??
    (isGuestCheckoutPlaceholderEmail(existingIntent.user.email)
      ? normalizedEmail
      : existingIntent.user.email);

  if (!checkoutEmail || normalizeEmail(checkoutEmail) !== normalizedEmail) {
    return badRequest("Use the same email that was used during checkout.");
  }

  if (claimState.checkoutUserOrigin !== "provisional") {
    return badRequest("This purchase is already attached to an existing account. Sign in instead.", 409);
  }

  if (claimState.alreadyClaimed) {
    return badRequest("This checkout access has already been claimed. Sign in to continue.", 409);
  }

  const user = await claimCheckoutUserAccount({
    userId: existingIntent.userId,
    email: normalizedEmail,
    password,
    fullName: body.fullName
  });

  if (!user) {
    return badRequest("The checkout account could not be claimed.", 404);
  }

  await prisma.checkoutIntent.update({
    where: {
      id: existingIntent.id
    },
    data: {
      metadata: {
        ...(typeof existingIntent.metadata === "object" && existingIntent.metadata
          ? existingIntent.metadata
          : {}),
        checkoutUserClaimedAt: new Date().toISOString()
      }
    }
  });

  return NextResponse.json({
    ok: true,
    email: user.email
  });
}
