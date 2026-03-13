import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  confirmPersistentCheckoutIntentPayment
} from "@/lib/commerce/server/grants";
import {
  buildStripeVerificationResult,
  constructStripeWebhookEvent
} from "@/lib/payments/providers/stripe";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import {
  getCheckoutIntentByProviderSessionId,
  updateCheckoutIntentById
} from "@/lib/server/services/checkout-intents";

export const runtime = "nodejs";

async function resolveIntentId(session: {
  id: string;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
}) {
  const metadataIntentId = session.metadata?.checkoutIntentId ?? null;

  if (metadataIntentId) {
    return metadataIntentId;
  }

  if (session.client_reference_id) {
    return session.client_reference_id;
  }

  const intent = await getCheckoutIntentByProviderSessionId(session.id);
  return intent?.id ?? null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: "stripe-missing-signature",
      status: "FAILED",
      level: "ERROR",
      message: "Stripe webhook request arrived without a signature header.",
      metadata: {
        provider: "stripe"
      }
    });
    return NextResponse.json(
      {
        error: "Missing Stripe signature header."
      },
      {
        status: 400
      }
    );
  }

  const payload = await request.text();
  const event = constructStripeWebhookEvent(payload, signature);

  if (!event) {
    await recordOperationalEvent({
      eventType: "payment_confirmation",
      eventKey: "stripe-webhook-not-configured",
      status: "FAILED",
      level: "ERROR",
      message: "Stripe webhook handling was attempted without a configured secret.",
      metadata: {
        provider: "stripe"
      }
    });
    return NextResponse.json(
      {
        error: "Stripe webhook handling is not configured."
      },
      {
        status: 503
      }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const intentId = await resolveIntentId(session);

      if (!intentId) {
        return NextResponse.json({ received: true });
      }

      const verification = buildStripeVerificationResult(session);

      if (!verification.ok) {
        await updateCheckoutIntentById(intentId, {
          status:
            verification.status === "expired"
              ? "EXPIRED"
              : verification.status === "pending"
                ? "REQUIRES_ACTION"
                : "FAILED",
          failureReason: verification.message,
          lastPaymentEventAt: new Date()
        });

        await recordOperationalEvent({
          eventType: "payment_confirmation",
          eventKey: intentId,
          status: "FAILED",
          level: verification.status === "pending" ? "WARN" : "ERROR",
          checkoutIntentId: intentId,
          message: verification.message,
          metadata: {
            provider: "stripe",
            providerSessionId: session.id,
            verificationStatus: verification.status
          }
        });

        return NextResponse.json({ received: true });
      }

      await confirmPersistentCheckoutIntentPayment(intentId, verification.confirmation);
      await recordOperationalEvent({
        eventType: "payment_confirmation",
        eventKey: intentId,
        status: "SUCCEEDED",
        checkoutIntentId: intentId,
        message: "Stripe webhook confirmed payment successfully.",
        metadata: {
          provider: "stripe",
          providerSessionId: session.id
        }
      });
      return NextResponse.json({ received: true });
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const intentId = await resolveIntentId(session);

      if (intentId) {
        await updateCheckoutIntentById(intentId, {
          status: "EXPIRED",
          failureReason: "Stripe Checkout session expired.",
          lastPaymentEventAt: new Date()
        });

        await recordOperationalEvent({
          eventType: "payment_confirmation",
          eventKey: intentId,
          status: "FAILED",
          level: "WARN",
          checkoutIntentId: intentId,
          message: "Stripe Checkout session expired.",
          metadata: {
            provider: "stripe",
            providerSessionId: session.id
          }
        });
      }

      return NextResponse.json({ received: true });
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const intentId = await resolveIntentId(session);

      if (intentId) {
        await updateCheckoutIntentById(intentId, {
          status: "FAILED",
          failureReason: "Stripe reported that the asynchronous payment failed.",
          lastPaymentEventAt: new Date()
        });

        await recordOperationalEvent({
          eventType: "payment_confirmation",
          eventKey: intentId,
          status: "FAILED",
          level: "ERROR",
          checkoutIntentId: intentId,
          message: "Stripe reported that the asynchronous payment failed.",
          metadata: {
            provider: "stripe",
            providerSessionId: session.id
          }
        });
      }

      return NextResponse.json({ received: true });
    }
    default:
      return NextResponse.json({ received: true });
  }
}
