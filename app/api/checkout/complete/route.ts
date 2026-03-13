import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  finalizePersistentCheckoutIntent,
  finalizePersistentCheckoutIntentById
} from "@/lib/commerce/server/grants";
import { verifyStoredCheckoutIntentPayment } from "@/lib/payments/service";
import {
  getCheckoutIntentById,
  getCheckoutIntentForUser
} from "@/lib/server/services/checkout-intents";

function isGuestCheckoutPlaceholderEmail(value: string | null | undefined) {
  return Boolean(value && value.toLowerCase().endsWith("@checkout.local"));
}

function parseCheckoutIdentity(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return {
      checkoutEmail: null as string | null,
      checkoutUserOrigin: null as "authenticated" | "existing" | "provisional" | null,
      requiresAccountClaim: false,
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
    requiresAccountClaim:
      record.requiresAccountClaim === true || checkoutUserOrigin === "provisional",
    alreadyClaimed:
      typeof record.checkoutUserClaimedAt === "string" &&
      record.checkoutUserClaimedAt.length > 0
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  const body = (await request.json()) as {
    intentId?: string;
    allowDemoFallback?: boolean;
  };

  if (!body.intentId) {
    return NextResponse.json(
      {
        error: "Intent id is required."
      },
      {
        status: 400
      }
    );
  }

  const intentId = body.intentId;
  const existingIntent = user
    ? await getCheckoutIntentForUser(user.id, intentId)
    : await getCheckoutIntentById(intentId);

  if (!existingIntent) {
    return NextResponse.json(
      {
        error: "Checkout intent could not be found."
      },
      {
        status: 404
      }
    );
  }

  const result =
    existingIntent.purchase
      ? user
        ? await finalizePersistentCheckoutIntent(user.id, intentId)
        : await finalizePersistentCheckoutIntentById(intentId)
      : await verifyStoredCheckoutIntentPayment(existingIntent).then(async (verification) => {
          if (!verification.ok) {
            const canUseDemoFallback =
              process.env.NODE_ENV === "development" &&
              body.allowDemoFallback === true &&
              existingIntent.status === "FAILED" &&
              typeof existingIntent.failureReason === "string" &&
              existingIntent.failureReason.includes("not configured");

            if (canUseDemoFallback) {
              return user
                ? finalizePersistentCheckoutIntent(user.id, intentId, {
                    allowUnverified: true
                  })
                : finalizePersistentCheckoutIntentById(intentId, {
                    allowUnverified: true
                  });
            }

            return NextResponse.json(
              {
                error: verification.message,
                status: verification.status
              },
              {
                status:
                  verification.status === "pending"
                    ? 409
                    : verification.status === "expired"
                      ? 410
                      : 402
              }
            );
          }

          return user
            ? finalizePersistentCheckoutIntent(user.id, intentId, {
                confirmation: verification.confirmation
              })
            : finalizePersistentCheckoutIntentById(intentId, {
                confirmation: verification.confirmation
              });
        });

  if (result instanceof NextResponse) {
    return result;
  }

  if (!result) {
    return NextResponse.json(
      {
        error: "Checkout intent could not be finalized."
      },
      {
        status: 404
      }
    );
  }

  const latestIntent = await getCheckoutIntentById(intentId);
  const checkoutIdentity = parseCheckoutIdentity(
    latestIntent?.metadata ?? existingIntent.metadata
  );
  const resolvedCheckoutEmail =
    checkoutIdentity.checkoutEmail ??
    latestIntent?.user.email ??
    existingIntent.user.email;
  const checkoutEmail = isGuestCheckoutPlaceholderEmail(resolvedCheckoutEmail)
    ? null
    : resolvedCheckoutEmail;

  return NextResponse.json({
    ok: true,
    persistenceMode: "database",
    checkoutEmail,
    accessHandoff:
      !user &&
      checkoutIdentity.checkoutUserOrigin === "provisional" &&
      !checkoutIdentity.alreadyClaimed
        ? "claim_account"
        : !user &&
            (checkoutIdentity.checkoutUserOrigin === "existing" ||
              (checkoutIdentity.checkoutUserOrigin === "provisional" &&
                checkoutIdentity.alreadyClaimed))
          ? "sign_in"
          : "open_report",
    ...result
  });
}
