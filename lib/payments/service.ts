import "server-only";

import type { CheckoutIntent } from "@prisma/client";

import { isPaymentProviderLive, normalizeLivePaymentProvider } from "@/lib/payments/config";
import {
  buildRazorpayVerificationResult,
  createRazorpayOrder,
  fetchRazorpayPaymentDetails
} from "@/lib/payments/providers/razorpay";
import {
  buildStripeVerificationResult,
  createStripeCheckoutSession,
  retrieveStripeCheckoutSession
} from "@/lib/payments/providers/stripe";
import type { PaymentCheckoutDescriptor, PaymentCheckoutInput, PaymentVerificationResult } from "@/lib/payments/types";

function parseProviderPaymentId(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const record = metadata as Record<string, unknown>;
  return typeof record.providerPaymentId === "string" ? record.providerPaymentId : null;
}

export async function createLivePaymentCheckout(
  input: PaymentCheckoutInput
): Promise<PaymentCheckoutDescriptor | null> {
  const provider = normalizeLivePaymentProvider(input.paymentProvider);

  if (!provider || !isPaymentProviderLive(input.paymentProvider)) {
    return null;
  }

  if (provider === "razorpay") {
    return createRazorpayOrder(input);
  }

  if (provider === "stripe") {
    return createStripeCheckoutSession(input);
  }

  return null;
}

export async function verifyStoredCheckoutIntentPayment(
  checkoutIntent: Pick<
    CheckoutIntent,
    | "paymentProvider"
    | "providerSessionId"
    | "providerOrderId"
    | "amountCents"
    | "currency"
    | "metadata"
  >
): Promise<PaymentVerificationResult> {
  if (checkoutIntent.paymentProvider === "STRIPE" && checkoutIntent.providerSessionId) {
    const session = await retrieveStripeCheckoutSession(checkoutIntent.providerSessionId);

    if (!session) {
      return {
        ok: false,
        status: "failed",
        message: "Stripe is not configured, so the checkout session could not be verified."
      };
    }

    return buildStripeVerificationResult(session);
  }

  if (checkoutIntent.paymentProvider === "RAZORPAY") {
    const providerPaymentId = parseProviderPaymentId(checkoutIntent.metadata);

    if (!checkoutIntent.providerOrderId || !providerPaymentId) {
      return {
        ok: false,
        status: "pending",
        message:
          "Razorpay payment verification is still waiting for the confirmed payment reference."
      };
    }

    const paymentDetails = await fetchRazorpayPaymentDetails(providerPaymentId);

    if (!paymentDetails) {
      return {
        ok: false,
        status: "pending",
        message: "Razorpay payment details could not be loaded yet."
      };
    }

    if (paymentDetails.status === "failed") {
      return {
        ok: false,
        status: "failed",
        message: "Razorpay reported that the payment did not complete successfully."
      };
    }

    if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
      return {
        ok: false,
        status: "pending",
        message: "Razorpay payment confirmation is still pending."
      };
    }

    return buildRazorpayVerificationResult({
      orderId: checkoutIntent.providerOrderId,
      paymentId: providerPaymentId,
      amountCents: checkoutIntent.amountCents,
      currency: checkoutIntent.currency === "INR" ? "INR" : "USD",
      checkoutEmail:
        typeof paymentDetails.email === "string" ? paymentDetails.email : null,
      checkoutFullName:
        typeof paymentDetails.notes?.name === "string" ? paymentDetails.notes.name : null,
      checkoutContact:
        typeof paymentDetails.contact === "string" ? paymentDetails.contact : null
    });
  }

  return {
    ok: false,
    status: "failed",
    message: "No supported live payment provider is attached to this checkout intent."
  };
}
