"use client";

import { useState } from "react";

import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldIcon } from "@/components/ui/icons";
import { storeCheckoutIntent } from "@/lib/commerce/ownership-store";
import { loadRazorpayCheckoutScript, openRazorpayCheckout } from "@/lib/payments/razorpay-client";
import type { CheckoutSessionDescriptor } from "@/lib/commerce/types";
import type {
  ReportUnlockOffer,
  ReportUnlockOfferSuite
} from "@/lib/offers/report-offers";
import type { AssessmentDefinition } from "@/lib/types/assessment-domain";

import { UnlockOfferCard } from "./unlock-offer-card";

type PurchaseFlowShellProps = {
  assessment: AssessmentDefinition;
  assessmentSessionId?: string | null;
  offerSuite: ReportUnlockOfferSuite;
  accountUserId: string;
  hasHydrated?: boolean;
  compact?: boolean;
};

function productTypeLabel(productType: ReportUnlockOffer["productType"]) {
  if (productType === "subscription") {
    return "Membership path";
  }

  if (productType === "explanation_session") {
    return "Guided walkthrough";
  }

  if (productType === "premium_report") {
    return "Premium report";
  }

  return "One-time report";
}

function buildSelectedOfferSummary(
  offer: ReportUnlockOffer,
  membershipPostDescription: string,
  premiumPriceLabel: string
) {
  if (offer.productType === "subscription") {
    return [
      "Saved access expands from one report into a broader private library.",
      "Future report comparisons and connected insights stay attached to the same account.",
      membershipPostDescription
    ];
  }

  if (offer.productType === "explanation_session") {
    return [
      "The report stays central, and the walkthrough is attached to the same ownership record.",
      "This path is a structured discussion of the report, not therapy or diagnosis.",
      "Contact or scheduling details can be added later without changing report access."
    ];
  }

  if (offer.pricingTier === "premium") {
    return [
      "The premium path keeps the same ownership flow while opening the broader one-time interpretation.",
      "The report is saved to your dashboard for return access later.",
      "Download and delivery actions remain attached to the same saved report."
    ];
  }

  return [
    "The report is saved to your dashboard after purchase.",
    "Delivery and download actions stay attached to the same owned report.",
    `If you want more depth later, the premium one-time path remains available at ${premiumPriceLabel}.`
  ];
}

function buildReturnToPath(regionKey: "india" | "international") {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(window.location.href);

  if (
    process.env.NODE_ENV === "development" &&
    url.pathname.startsWith("/assessments/") &&
    url.pathname.endsWith("/take")
  ) {
    url.searchParams.set("region", regionKey);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function PurchaseFlowShell({
  assessment,
  assessmentSessionId = null,
  offerSuite,
  accountUserId,
  hasHydrated = true,
  compact = false
}: PurchaseFlowShellProps) {
  const { regionKey, membershipContent } = useCommerceRegion();
  const membershipNarrative = membershipContent.membershipNarrative;
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const offers = [offerSuite.primaryOffer, ...offerSuite.secondaryOffers];
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? null;
  const isMembershipSelection = selectedOffer?.productType === "subscription";
  const isExplanationSelection = selectedOffer?.productType === "explanation_session";
  const selectedOfferSummary = selectedOffer
    ? buildSelectedOfferSummary(
        selectedOffer,
        membershipNarrative.postPurchaseDescription,
        offerSuite.premiumOffer.priceLabel
      )
    : [];
  const compactReassurance = "Private. Saved to your account. Read anytime.";

  async function createCheckoutSession(offer: ReportUnlockOffer) {
    const response = await fetch("/api/checkout/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: accountUserId,
        assessmentSessionId,
        assessmentSlug: assessment.slug,
        assessmentTitle: assessment.title,
        topic: assessment.category,
        regionKey,
        offerId: offer.id,
        offerTitle: offer.title,
        purchaseType: offer.productType,
        priceCents: offer.priceCents,
        currency: offer.currencyCode,
        paymentProvider: offer.paymentProvider,
        sourceBlogUrl: null,
        sourceTopic: assessment.category,
        includedAssessmentSlugs: offer.includedAssessmentSlugs ?? [],
        subscriptionPlanCode: offer.subscriptionPlanCode ?? null,
        returnToPath: compact ? buildReturnToPath(regionKey) : null
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error ?? "Unable to create the checkout session.");
    }

    const descriptor = (await response.json()) as CheckoutSessionDescriptor;

    if (
      process.env.NODE_ENV === "development" &&
      descriptor.persistenceMode === "local_demo"
    ) {
      storeCheckoutIntent(descriptor.intent);
    }

    return descriptor;
  }

  function navigateTo(url: string) {
    window.location.assign(url);
  }

  async function launchRazorpayCheckout(descriptor: CheckoutSessionDescriptor) {
    if (!descriptor.providerPayload || descriptor.providerPayload.provider !== "razorpay") {
      throw new Error("Razorpay checkout data is missing.");
    }

    const loaded = await loadRazorpayCheckoutScript();

    if (!loaded) {
      throw new Error("Razorpay checkout could not be loaded.");
    }

    const instance = openRazorpayCheckout({
      key: descriptor.providerPayload.keyId,
      amount: descriptor.providerPayload.amount,
      currency: descriptor.providerPayload.currency,
      name: descriptor.providerPayload.name,
      description: descriptor.providerPayload.description,
      order_id: descriptor.providerPayload.orderId,
      prefill: descriptor.providerPayload.prefill,
      theme: {
        color: descriptor.providerPayload.themeColor
      },
      modal: {
        ondismiss: () => {
          setIsRedirecting(false);
          if (compact) {
            setErrorMessage(
              "Payment was not completed. The report remains locked until checkout finishes successfully."
            );
            return;
          }

          navigateTo(descriptor.cancelUrl);
        }
      },
      handler: async (response) => {
        try {
          const verificationResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              intentId: descriptor.intent.id,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          const payload = (await verificationResponse.json()) as {
            ok?: boolean;
            error?: string;
            successUrl?: string;
          };

          if (!verificationResponse.ok || !payload.ok || !payload.successUrl) {
            throw new Error(
              payload.error ?? "Razorpay payment verification could not be completed."
            );
          }

          navigateTo(payload.successUrl);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Razorpay payment verification could not be completed."
          );
          setIsRedirecting(false);
        }
      }
    });

    instance.on("payment.failed", () => {
      setErrorMessage(
        "The payment did not complete. You can review the offer again or try the checkout once more."
      );
      setIsRedirecting(false);
    });
  }

  async function handleRedirect(
    offer: ReportUnlockOffer,
    destination: "success" | "cancel"
  ) {
    try {
      setIsRedirecting(true);
      setErrorMessage(null);
      const descriptor = await createCheckoutSession(offer);

      if (destination === "cancel") {
        navigateTo(descriptor.cancelUrl);
        return;
      }

      if (descriptor.checkoutMethod === "razorpay_modal") {
        await launchRazorpayCheckout(descriptor);
        return;
      }

      navigateTo(descriptor.redirectUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the checkout flow."
      );
      setIsRedirecting(false);
    }
  }

  return (
    <div id="unlock-path" className="space-y-5">
      <Card variant="raised" className="panel-grid overflow-hidden preview-reveal">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{offerSuite.primaryOffer.badge}</Badge>
            {compact ? (
              <Badge variant="outline">Single-report purchase</Badge>
            ) : (
              <Badge variant="outline">Full report access</Badge>
            )}
            <Badge variant="outline">Private and confidential</Badge>
          </div>
          <CardTitle className="text-[1.85rem] leading-[1.06] sm:text-[2.05rem]">
            {compact
              ? "Unlock the full report while the pattern is still clear."
              : "Unlock the full insight report"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={compact ? "grid gap-4" : "grid gap-5 lg:grid-cols-[0.94fr_1.06fr]"}>
            <div className="surface-block-strong p-5 sm:p-6">
              <p className="insight-label">
                {compact ? "Full report access" : "Unlock price"}
              </p>
              <p className="mt-3 text-[2.35rem] font-semibold tracking-[-0.05em] text-foreground">
                {offerSuite.primaryOffer.priceLabel}
              </p>
              {compact ? (
                <p className="mt-2 text-sm leading-7 text-foreground/82">
                  Single-report purchase
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-7 text-muted">
                {compact
                  ? "Unlock the deeper interpretation, pressure points, and steadier guidance kept behind the preview."
                  : offerSuite.primaryOffer.reassurance}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  size="xl"
                  onClick={() => handleRedirect(offerSuite.primaryOffer, "success")}
                  disabled={!hasHydrated || isRedirecting}
                >
                  {isRedirecting
                    ? "Preparing secure checkout..."
                    : compact
                      ? `${offerSuite.primaryOffer.ctaLabel} · ${offerSuite.primaryOffer.priceLabel}`
                      : offerSuite.primaryOffer.ctaLabel}
                </Button>
                {!compact ? (
                  <LinkButton href="/pricing" variant="outline" size="lg">
                    Compare Access Options
                  </LinkButton>
                ) : null}
              </div>
              {compact ? (
                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {[
                    "Full report access",
                    "Saved in your account",
                    "Read anytime later"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
              {compact ? (
                <p className="mt-4 text-sm leading-7 text-muted">
                  {compactReassurance}
                </p>
              ) : (
                <div className="mt-5 grid gap-2.5">
                  {[
                    "Saved in your dashboard after purchase.",
                    "Download and email access remain available later.",
                    regionKey === "india"
                      ? "Structured for reflection and clarity, not diagnosis."
                      : "Structured for reflection and pattern recognition, not diagnosis."
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {compact ? null : (
              <div className="space-y-3">
                <div className="report-paper p-5 sm:p-6">
                  <p className="insight-label">What opens in the full report</p>
                  <div className="mt-4 grid gap-3">
                    {[...offerSuite.valueHighlights.slice(0, 3), ...offerSuite.primaryOffer.benefits.slice(0, 2)].map((item) => (
                      <div
                        key={item}
                        className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3.5 text-sm leading-7 text-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {compact && errorMessage ? (
            <div className="surface-block px-5 py-5">
              <p className="insight-label">Checkout note</p>
              <p className="mt-3 text-sm leading-7 text-muted">{errorMessage}</p>
            </div>
          ) : null}
          {compact ? null : (
            <div className="px-1 text-sm leading-7 text-muted">
              {offerSuite.trustNotes[0]}
            </div>
          )}
        </CardContent>
      </Card>

      {!compact ? (
        <>
          <div className="space-y-1">
            <Badge variant="outline">Other ways to continue</Badge>
            <p className="text-sm leading-7 text-muted">
              If another path fits better, it still stays attached to this same report and account.
            </p>
          </div>

          <div
            className={
              offerSuite.secondaryOffers.length > 2
                ? "grid gap-5 xl:grid-cols-3"
                : "grid gap-5 xl:grid-cols-2"
            }
          >
            {offerSuite.secondaryOffers.map((offer) => (
              <UnlockOfferCard
                key={offer.id}
                offer={offer}
                onChoose={(nextOffer) => setSelectedOfferId(nextOffer.id)}
              />
            ))}
          </div>

          {selectedOffer ? (
            <Card className="h-full">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">Checkout path</Badge>
              <Badge variant="outline">{productTypeLabel(selectedOffer.productType)}</Badge>
              {isMembershipSelection ? (
                <Badge variant="outline">{membershipNarrative.annualBadge}</Badge>
              ) : isExplanationSelection ? (
                <Badge variant="outline">Guided walkthrough</Badge>
              ) : null}
            </div>
            <CardTitle className="text-[1.55rem]">
              {isMembershipSelection
                ? "Review the broader membership path before continuing."
                : isExplanationSelection
                  ? "Review the guided report walkthrough option before continuing."
                : "Review this report access path before continuing."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="surface-block-strong p-5 sm:p-6">
                <p className="insight-label">Selected offer</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {selectedOffer.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {selectedOffer.description}
                </p>
                <p className="mt-4 text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
                  {selectedOffer.priceLabel}
                </p>
                {selectedOffer.secondaryPriceLabel ? (
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {selectedOffer.secondaryPriceLabel}
                  </p>
                ) : null}
              </div>
              <div className="space-y-3">
                <div className="surface-block px-5 py-5">
                  <p className="insight-label">What happens next</p>
                  <div className="mt-4 grid gap-3">
                    {selectedOfferSummary.map((item) => (
                      <div
                        key={item}
                        className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="surface-block px-5 py-5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-foreground">
                      <ShieldIcon className="h-4 w-4" />
                    </span>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground">
                        Secure checkout
                      </p>
                      <p className="text-sm leading-7 text-muted">
                        Payment confirmation stays tied to the same ownership and dashboard flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage ? (
              <div className="surface-block px-5 py-5">
                <p className="insight-label">Checkout note</p>
                <p className="mt-3 text-sm leading-7 text-muted">{errorMessage}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4">
              <Button
                size="xl"
                onClick={() => handleRedirect(selectedOffer, "success")}
                disabled={!hasHydrated || isRedirecting}
              >
                {isRedirecting ? "Preparing secure checkout..." : "Continue to secure checkout"}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => handleRedirect(selectedOffer, "cancel")}
                disabled={!hasHydrated || isRedirecting}
              >
                Exit this checkout path
              </Button>
              <Button
                variant="ghost"
                size="xl"
                onClick={() => setSelectedOfferId(null)}
                disabled={isRedirecting}
              >
                Back To Options
              </Button>
            </div>
          </CardContent>
        </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
