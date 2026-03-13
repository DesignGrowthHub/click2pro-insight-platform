import { NextResponse } from "next/server";

import { confirmPersistentCheckoutIntentPayment } from "@/lib/commerce/server/grants";
import {
  fetchRazorpayPaymentDetails,
  verifyRazorpayWebhookSignature
} from "@/lib/payments/providers/razorpay";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import {
  getCheckoutIntentByProviderOrderId,
  updateCheckoutIntentById
} from "@/lib/server/services/checkout-intents";
import { normalizeNullableString } from "@/lib/server/utils";

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: "razorpay-missing-signature",
      status: "FAILED",
      level: "ERROR",
      message: "Razorpay webhook request arrived without a signature header.",
      metadata: {
        provider: "razorpay"
      }
    });
    return NextResponse.json(
      {
        error: "Missing Razorpay signature header."
      },
      {
        status: 400
      }
    );
  }

  const payloadText = await request.text();

  if (!verifyRazorpayWebhookSignature(payloadText, signature)) {
    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: "razorpay-invalid-webhook-signature",
      status: "FAILED",
      level: "ERROR",
      message: "Razorpay webhook signature validation failed.",
      metadata: {
        provider: "razorpay"
      }
    });
    return NextResponse.json(
      {
        error: "Invalid Razorpay webhook signature."
      },
      {
        status: 400
      }
    );
  }

  const payload = JSON.parse(payloadText) as RazorpayWebhookPayload;
  const orderId =
    payload.payload?.payment?.entity?.order_id ?? payload.payload?.order?.entity?.id ?? null;

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const intent = await getCheckoutIntentByProviderOrderId(orderId);

  if (!intent) {
    return NextResponse.json({ received: true });
  }

  if (payload.event === "payment.failed") {
    await updateCheckoutIntentById(intent.id, {
      status: "FAILED",
      failureReason: "Razorpay reported a failed payment.",
      lastPaymentEventAt: new Date()
    });

    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: intent.id,
      status: "FAILED",
      level: "ERROR",
      checkoutIntentId: intent.id,
      message: "Razorpay reported a failed payment.",
      metadata: {
        provider: "razorpay",
        providerOrderId: orderId
      }
    });

    return NextResponse.json({ received: true });
  }

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    const amount =
      payload.payload?.payment?.entity?.amount ??
      payload.payload?.order?.entity?.amount ??
      intent.amountCents;
    const currency =
      payload.payload?.payment?.entity?.currency ??
      payload.payload?.order?.entity?.currency ??
      intent.currency;
    const paymentId = payload.payload?.payment?.entity?.id ?? null;
    const paymentDetails = paymentId
      ? await fetchRazorpayPaymentDetails(paymentId).catch(() => null)
      : null;

    await confirmPersistentCheckoutIntentPayment(intent.id, {
      provider: "razorpay",
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      amountCents: amount,
      currency: currency === "INR" ? "INR" : "USD",
      paidAt: new Date(),
      metadata: {
        ...(typeof paymentDetails?.email === "string"
          ? {
              checkoutEmail: paymentDetails.email
            }
          : {}),
        ...(typeof paymentDetails?.contact === "string"
          ? {
              checkoutContact: paymentDetails.contact
            }
          : {}),
        ...(typeof paymentDetails?.notes?.name === "string"
          ? {
              checkoutFullName: normalizeNullableString(paymentDetails.notes.name)
            }
          : {})
      }
    });

    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: intent.id,
      status: "SUCCEEDED",
      checkoutIntentId: intent.id,
      message: "Razorpay webhook confirmed payment successfully.",
      metadata: {
        provider: "razorpay",
        providerOrderId: orderId
      }
    });
  }

  return NextResponse.json({ received: true });
}
