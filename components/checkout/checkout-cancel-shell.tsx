"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelCheckoutIntent } from "@/lib/commerce/ownership-store";
import type { CheckoutIntent } from "@/lib/commerce/types";

export function CheckoutCancelShell() {
  const searchParams = useSearchParams();
  const intentId = searchParams?.get("intent");
  const mode = searchParams?.get("mode");
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);

  useEffect(() => {
    if (!intentId) {
      return;
    }

    let cancelled = false;

    async function cancel() {
      try {
        const response = await fetch("/api/checkout/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            intentId
          })
        });

        if (!response.ok) {
          throw new Error("Falling back to local placeholder cancel.");
        }

        const payload = (await response.json()) as {
          ok: boolean;
          intentId: string;
          assessmentSlug: string;
          assessmentTitle: string;
          regionKey: "international" | "india";
          returnUrl?: string | null;
          status: "canceled" | "paid";
        };

        if (!cancelled) {
          setIntent({
            id: payload.intentId,
            userId: "",
            assessmentSessionId: null,
            assessmentSlug: payload.assessmentSlug,
            assessmentTitle: payload.assessmentTitle,
            topic: "Insight",
            regionKey: payload.regionKey,
            offerId: "",
            offerTitle: "",
            purchaseType: "single_report",
            priceCents: 0,
            currency: payload.regionKey === "india" ? "INR" : "USD",
            provider:
              payload.regionKey === "india"
                ? "razorpay_placeholder"
                : "stripe_placeholder",
            providerSessionId: null,
            providerOrderId: null,
            checkoutMode: "payment",
            providerPriceLookupKey: null,
            successUrl: "",
            cancelUrl: payload.returnUrl ?? "",
            status: payload.status === "paid" ? "paid" : "canceled",
            sourceBlogUrl: null,
            sourceTopic: null,
            includedAssessmentSlugs: [],
            subscriptionPlanCode: null,
            createdAt: new Date().toISOString(),
            completedAt: null
          });
        }

        return;
      } catch {
        if (mode !== "demo" || process.env.NODE_ENV !== "development") {
          return;
        }

        const result = cancelCheckoutIntent(intentId as string);
        if (!cancelled) {
          setIntent(result.intent);
        }
      }
    }

    void cancel();

    return () => {
      cancelled = true;
    };
  }, [intentId]);

  return (
    <Card variant="raised">
      <CardHeader className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Checkout canceled</Badge>
          {intent ? <Badge variant="outline">{intent.assessmentTitle}</Badge> : null}
        </div>
        <CardTitle className="text-[1.9rem] leading-[1.06] sm:text-[2.15rem]">
          No purchase was completed, so the report remains in preview mode.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="body-md">
          The cancel path is preserved here so a real checkout can return the user
          calmly to preview mode without losing context or pushing into a hard sell.
        </p>
        <div className="surface-block px-5 py-5">
          <p className="insight-label">What happens next</p>
          <p className="mt-3 text-base leading-8 text-foreground">
            Preview insights stay available. The full report remains locked until a
            completed purchase, bundle, or qualifying membership access is confirmed.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <LinkButton
            href={
              intent?.cancelUrl?.trim()
                ? intent.cancelUrl
                : intent
                  ? `/reports/${intent.assessmentSlug}`
                  : "/assessments"
            }
            size="lg"
          >
            Return To Report Preview
          </LinkButton>
          <LinkButton href="/assessments" variant="outline" size="lg">
            Explore Assessments
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
