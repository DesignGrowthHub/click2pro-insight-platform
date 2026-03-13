import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  buildRazorpayVerificationResult,
  fetchRazorpayPaymentDetails,
  verifyRazorpayPaymentSignature
} from "@/lib/payments/providers/razorpay";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import {
  getCheckoutIntentById,
  getCheckoutIntentForUser,
  updateCheckoutIntentById
} from "@/lib/server/services/checkout-intents";
import { normalizeNullableString } from "@/lib/server/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  const body = (await request.json()) as {
    intentId?: string;
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };

  if (!body.intentId || !body.orderId || !body.paymentId || !body.signature) {
    return NextResponse.json(
      {
        error: "Missing Razorpay verification fields."
      },
      {
        status: 400
      }
    );
  }

  const intent = user
    ? await getCheckoutIntentForUser(user.id, body.intentId)
    : await getCheckoutIntentById(body.intentId);

  if (!intent) {
    return NextResponse.json(
      {
        error: "Checkout intent could not be found."
      },
      {
        status: 404
      }
    );
  }

  const signatureValid = verifyRazorpayPaymentSignature({
    orderId: body.orderId,
    paymentId: body.paymentId,
    signature: body.signature
  });

  if (!signatureValid) {
    await updateCheckoutIntentById(intent.id, {
      status: "FAILED",
      failureReason: "Razorpay signature verification failed.",
      lastPaymentEventAt: new Date()
    });

    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: intent.id,
      status: "FAILED",
      level: "ERROR",
      userId: intent.userId,
      checkoutIntentId: intent.id,
      message: "Razorpay payment signature verification failed.",
      metadata: {
        provider: "razorpay",
        providerOrderId: body.orderId,
        providerPaymentId: body.paymentId
      }
    });

    return NextResponse.json(
      {
        error: "Razorpay payment verification failed."
      },
      {
        status: 402
      }
    );
  }

  const paymentDetails = await fetchRazorpayPaymentDetails(body.paymentId).catch(
    () => null
  );
  const verification = buildRazorpayVerificationResult({
    orderId: body.orderId,
    paymentId: body.paymentId,
    amountCents: intent.amountCents,
    currency: intent.currency === "INR" ? "INR" : "USD",
    checkoutEmail:
      typeof paymentDetails?.email === "string" ? paymentDetails.email : null,
    checkoutFullName: normalizeNullableString(
      typeof paymentDetails?.notes?.name === "string" ? paymentDetails.notes.name : null
    ),
    checkoutContact:
      typeof paymentDetails?.contact === "string" ? paymentDetails.contact : null
  });

  if (!verification.ok) {
    return NextResponse.json(
      {
        error: verification.message
      },
      {
        status: 402
      }
    );
  }

  const existingMetadata =
    intent.metadata && typeof intent.metadata === "object"
      ? (intent.metadata as Record<string, unknown>)
      : {};

  await updateCheckoutIntentById(intent.id, {
    status: "REQUIRES_ACTION",
    providerOrderId: body.orderId,
    paymentConfirmedAt: verification.confirmation.paidAt,
    lastPaymentEventAt: verification.confirmation.paidAt,
    failureReason: null,
    metadata: {
      ...existingMetadata,
      ...(verification.confirmation.metadata ?? {}),
      providerPaymentId: body.paymentId
    }
  });

  await recordOperationalEvent({
    eventType: "payment_confirmation",
    eventKey: intent.id,
    status: "SUCCEEDED",
    userId: intent.userId,
    checkoutIntentId: intent.id,
    message:
      "Razorpay signed payment verification completed. Final ownership handoff will continue on the success route.",
    metadata: {
      provider: "razorpay",
      providerOrderId: body.orderId,
      providerPaymentId: body.paymentId
    }
  });

  const successUrl = new URL(
    intent.successUrl ?? `/checkout/success?intent=${intent.id}`,
    request.url
  );
  successUrl.searchParams.set("intent", intent.id);
  successUrl.searchParams.set("provider", "razorpay");

  return NextResponse.json({
    ok: true,
    successUrl: successUrl.toString(),
    intentId: intent.id
  });
}
