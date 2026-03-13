import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { createPersistentCheckoutSessionDescriptor } from "@/lib/commerce/server/checkout";
import { buildCheckoutSessionDescriptor } from "@/lib/commerce/stripe";
import type { CheckoutSessionRequest } from "@/lib/commerce/types";
import { toPrismaPaymentProvider } from "@/lib/commerce/server/mappers";
import { getOfferByType } from "@/lib/pricing";
import { getRazorpayConfig, getStripeConfig } from "@/lib/payments/config";
import { getServerCommerceRegionContext } from "@/lib/region/server";
import type { CommerceOfferType } from "@/lib/region/types";
import {
  createGuestCheckoutUser,
  resolveCheckoutUserByEmail
} from "@/lib/server/services/users";
import { normalizeEmail } from "@/lib/server/utils";

function isValidPayload(payload: Partial<CheckoutSessionRequest>): payload is CheckoutSessionRequest {
  return Boolean(
    payload.assessmentSlug &&
      payload.assessmentTitle &&
      payload.topic &&
      payload.regionKey &&
      payload.offerId &&
      payload.offerTitle &&
      payload.purchaseType &&
      typeof payload.priceCents === "number" &&
      payload.currency &&
      payload.paymentProvider
  );
}

function resolveAuthoritativeOfferType(
  payload: CheckoutSessionRequest
): CommerceOfferType | null {
  if (payload.purchaseType === "single_report") {
    return "single_report";
  }

  if (payload.purchaseType === "premium_report") {
    return "premium_report";
  }

  if (payload.purchaseType === "subscription") {
    return payload.subscriptionPlanCode?.includes("monthly")
      ? "membership_monthly"
      : "membership_annual";
  }

  if (payload.purchaseType === "explanation_session") {
    const offerFingerprint = `${payload.offerId} ${payload.offerTitle}`.toLowerCase();
    return offerFingerprint.includes("60")
      ? "report_plus_explanation_60"
      : "report_plus_explanation_30";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<CheckoutSessionRequest> & {
    checkoutEmail?: string | null;
  };

  if (!isValidPayload(body)) {
    return NextResponse.json(
      {
        error: "Invalid checkout session payload."
      },
      { status: 400 }
    );
  }

  const currentUser = await getCurrentUser();
  const regionContext = await getServerCommerceRegionContext();
  const resolvedRegionKey = regionContext.regionKey;
  const resolvedPaymentProvider = regionContext.paymentProvider;
  const stripeConfig = getStripeConfig();
  const razorpayConfig = getRazorpayConfig();
  const providerKeysDetected =
    resolvedPaymentProvider === "stripe"
      ? Boolean(stripeConfig.secretKey)
      : Boolean(razorpayConfig.keyId && razorpayConfig.secretKey);
  const authoritativeOfferType = resolveAuthoritativeOfferType(body);
  const authoritativeOffer = authoritativeOfferType
    ? getOfferByType(resolvedRegionKey, authoritativeOfferType)
    : null;
  const checkoutRequest: CheckoutSessionRequest = {
    ...body,
    userId: currentUser?.id ?? body.userId ?? "guest-checkout",
    regionKey: resolvedRegionKey,
    offerId: authoritativeOffer?.id ?? body.offerId,
    offerTitle: authoritativeOffer?.title ?? body.offerTitle,
    priceCents: authoritativeOffer?.priceMinor ?? body.priceCents,
    currency: authoritativeOffer?.currencyCode ?? regionContext.currencyCode,
    paymentProvider: resolvedPaymentProvider,
    returnToPath: body.returnToPath ?? null
  };
  const normalizedCheckoutEmail =
    typeof body.checkoutEmail === "string" && body.checkoutEmail.trim().length > 0
      ? normalizeEmail(body.checkoutEmail)
      : null;

  if (process.env.NODE_ENV !== "production") {
    console.info("[checkout-session]", {
      requestedRegion: body.regionKey,
      resolvedRegion: resolvedRegionKey,
      resolvedProvider: resolvedPaymentProvider,
      authoritativeOfferType,
      authoritativeOfferId: authoritativeOffer?.id ?? null,
      authenticated: Boolean(currentUser),
      checkoutEmailProvided: Boolean(normalizedCheckoutEmail),
      stripeKeyDetected: Boolean(stripeConfig.secretKey),
      razorpayKeyDetected: Boolean(razorpayConfig.keyId && razorpayConfig.secretKey),
      providerKeysDetected,
      decision: currentUser
        ? "persistent_checkout"
        : providerKeysDetected
          ? "guest_checkout"
          : "demo_fallback"
    });
  }

  try {
    const guestCheckoutUser =
      !currentUser && providerKeysDetected
        ? normalizedCheckoutEmail
          ? await resolveCheckoutUserByEmail({
              email: normalizedCheckoutEmail,
              country: resolvedRegionKey === "india" ? "IN" : null,
              region: resolvedRegionKey === "india" ? "India" : null,
              currency: regionContext.currencyCode,
              preferredPaymentProvider: toPrismaPaymentProvider(resolvedPaymentProvider)
            })
          : await createGuestCheckoutUser({
              country: resolvedRegionKey === "india" ? "IN" : null,
              region: resolvedRegionKey === "india" ? "India" : null,
              currency: regionContext.currencyCode,
              preferredPaymentProvider: toPrismaPaymentProvider(resolvedPaymentProvider)
            })
        : null;
    const checkoutUser = currentUser ?? guestCheckoutUser?.user ?? null;
    if (!checkoutUser && process.env.NODE_ENV !== "development") {
      throw new Error("Secure checkout is not available in this environment.");
    }

    const descriptor = checkoutUser
      ? await createPersistentCheckoutSessionDescriptor(
          checkoutUser,
          {
            ...checkoutRequest,
            userId: checkoutUser.id
          },
          request.nextUrl.origin,
          {
            checkoutEmail: currentUser ? checkoutUser.email : normalizedCheckoutEmail,
            checkoutUserOrigin: currentUser
              ? "authenticated"
              : guestCheckoutUser?.origin ?? null
          }
        )
      : buildCheckoutSessionDescriptor(checkoutRequest, request.nextUrl.origin);

    return NextResponse.json(descriptor);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[checkout-session:error]", {
        requestedRegion: body.regionKey,
        resolvedRegion: resolvedRegionKey,
        resolvedProvider: resolvedPaymentProvider,
        providerKeysDetected,
        message: error instanceof Error ? error.message : "Secure checkout could not be started."
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Secure checkout could not be started."
      },
      {
        status: 502
      }
    );
  }
}
