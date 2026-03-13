"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCheckoutCompletion } from "@/components/checkout/use-checkout-completion";
import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { ReportActions } from "@/components/reports/report-actions";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryIcon, ReportIcon, ShieldIcon, SubscriptionIcon } from "@/components/ui/icons";
import type { PurchaseRecord } from "@/lib/commerce/types";
import { buildProfileCompletionUrl } from "@/lib/profile/completion";

function productTypeLabel(type: PurchaseRecord["purchaseType"] | null | undefined) {
  if (type === "subscription") {
    return "Membership";
  }

  if (type === "bundle") {
    return "Bundle";
  }

  if (type === "explanation_session") {
    return "Guided walkthrough";
  }

  return "Report";
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function CheckoutSuccessShell() {
  const router = useRouter();
  const { membershipContent, pricingLabels, regionConfig } = useCommerceRegion();
  const membershipNarrative = membershipContent.membershipNarrative;
  const searchParams = useSearchParams();
  const intentId = searchParams?.get("intent");
  const mode = searchParams?.get("mode");
  const provider = searchParams?.get("provider");
  const { result, errorMessage } = useCheckoutCompletion(intentId, mode, provider);
  const [isRoutingToClaim, setIsRoutingToClaim] = useState(false);

  const reportViewUrl = result?.ownedReport?.viewUrl ?? "/dashboard";
  const profileCompletionUrl = useMemo(
    () => buildProfileCompletionUrl(reportViewUrl, true),
    [reportViewUrl]
  );
  const loginUrl = useMemo(() => {
    const params = new URLSearchParams({
      callbackUrl: profileCompletionUrl
    });

    if (result?.checkoutEmail) {
      params.set("email", result.checkoutEmail);
    }

    return `/login?${params.toString()}`;
  }, [profileCompletionUrl, result?.checkoutEmail]);
  const forgotPasswordUrl = useMemo(() => {
    const params = new URLSearchParams({
      callbackUrl: profileCompletionUrl
    });

    if (result?.checkoutEmail) {
      params.set("email", result.checkoutEmail);
    }

    return `/forgot-password?${params.toString()}`;
  }, [profileCompletionUrl, result?.checkoutEmail]);

  const claimRouteUrl = useMemo(() => {
    if (!intentId) {
      return "/checkout/claim";
    }

    const params = new URLSearchParams({
      intent: intentId
    });

    if (mode === "demo") {
      params.set("mode", "demo");
    }

    if (provider) {
      params.set("provider", provider);
    }

    return `/checkout/claim?${params.toString()}`;
  }, [intentId, mode, provider]);

  useEffect(() => {
    if (!intentId || !result || result.accessHandoff !== "claim_account") {
      return;
    }

    setIsRoutingToClaim(true);
    router.replace(claimRouteUrl);
  }, [claimRouteUrl, intentId, result, router]);

  if (!intentId) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-5">
          <Badge variant="outline">Checkout success</Badge>
          <CardTitle className="text-[1.8rem]">
            The success page is ready, but no checkout intent was attached to this visit.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="body-md">
            A live {regionConfig.paymentProvider === "razorpay" ? "Razorpay" : "Stripe"} checkout
            will redirect here with a verified session or intent reference so report ownership can
            be granted and saved.
          </p>
          <LinkButton href="/dashboard" size="lg">
            Open My Insight Library
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-5">
          <Badge variant={errorMessage ? "outline" : "accent"}>
            {errorMessage
              ? "Confirmation pending"
              : provider === "razorpay"
                ? "Verifying payment"
                : "Finalizing access"}
          </Badge>
          <CardTitle className="text-[1.8rem]">
            {errorMessage
              ? "Payment confirmation is still being checked before ownership is granted."
              : provider === "razorpay"
                ? "Your payment went through. We’re attaching access and preparing the saved report now."
                : "Confirming ownership and preparing the saved report handoff."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            {errorMessage
              ? errorMessage
              : provider === "razorpay"
                ? "Razorpay payment has been verified. We’re finishing the secure handoff so the report opens in the right account state."
                : "Your payment is complete. We’re attaching the purchased report to the right account path now."}
          </p>
          {errorMessage ? (
            <div className="flex flex-wrap gap-4">
              <LinkButton href="/dashboard" size="lg">
                Open My Insight Library
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="lg">
                Review Access Options
              </LinkButton>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (result.accessHandoff === "claim_account") {
    return (
      <Card variant="raised">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Payment confirmed</Badge>
            <Badge variant="outline">Secure account setup</Badge>
          </div>
          <CardTitle className="text-[2rem] leading-[1.05] sm:text-[2.25rem]">
            {isRoutingToClaim
              ? "Opening the secure account-claim step for your saved report."
              : "Your report is saved. Continue into secure account setup."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-md">
            Payment is complete. The next step is secure and short: create a password once, then
            continue straight into the saved report.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton
              href={claimRouteUrl}
              size="lg"
            >
              Continue To Account Setup
            </LinkButton>
            <LinkButton href={loginUrl} variant="outline" size="lg">
              I already have a password
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.accessHandoff === "sign_in") {
    return (
      <div className="space-y-6">
        <Card variant="raised" className="panel-grid overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Payment confirmed</Badge>
              <Badge variant="outline">Sign in to continue</Badge>
            </div>
            <CardTitle className="text-[2rem] leading-[1.05] sm:text-[2.25rem]">
              Your report is saved to an existing account.
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="surface-block-strong p-5 sm:p-6">
              <p className="insight-label">Saved for</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {result.checkoutEmail ?? "Your existing account"}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Payment is complete. Sign in with the same email to open the full report and keep
                it in your private library.
              </p>
            </div>
            <div className="space-y-4">
              <div className="surface-block px-5 py-5">
                <p className="insight-label">Next step</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                We found an existing account for this checkout email, so access is already waiting
                there.
              </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={loginUrl} size="xl">
                  Sign In And Open Report
                </LinkButton>
                <LinkButton href={forgotPasswordUrl} variant="outline" size="lg">
                  Reset Password
                </LinkButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card variant="raised" className="panel-grid overflow-hidden">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Access confirmed</Badge>
            <Badge variant="outline">
              {productTypeLabel(result.purchaseRecord?.purchaseType)}
            </Badge>
            {result.purchaseRecord ? (
              <Badge variant="outline">
                {formatCurrency(
                  result.purchaseRecord.pricePaidCents,
                  result.purchaseRecord.currency
                )}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-[2rem] leading-[1.05] sm:text-[2.3rem]">
            Your report access is now attached to the account and saved for dashboard ownership.
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="surface-block-strong p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-success/20 bg-success/10 text-success">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div className="space-y-3">
                <p className="text-base font-semibold text-foreground">
                  {result.ownedReport?.reportTitle ?? "Purchase saved"}
                </p>
                <p className="text-sm leading-7 text-muted">
                  The report is now attached to the account as a saved asset. It remains available
                  in the dashboard, carries a downloadable PDF asset, and supports account-email or
                  alternate-email delivery.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-block px-4 py-4">
              <p className="insight-label">Saved in dashboard</p>
              <p className="mt-2 text-base font-semibold text-foreground">Yes</p>
            </div>
            <div className="surface-block px-4 py-4">
              <p className="insight-label">Full report access</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {result.ownedReport?.unlock.fullReportVisible ? "Available" : "Preparing"}
              </p>
            </div>
            <div className="surface-block px-4 py-4 sm:col-span-2">
              <p className="insight-label">Delivery note</p>
              <p className="mt-2 text-base leading-8 text-muted">
                Download and email actions now sit on the same ownership layer as the report
                itself, so access feels durable rather than tied to a single checkout session.
              </p>
            </div>
            {result.ownedReport &&
            (result.ownedReport.generationStatus === "pending" ||
              result.ownedReport.generationStatus === "generating" ||
              result.ownedReport.file.status === "processing" ||
              result.ownedReport.delivery.accountEmailStatus === "queued") ? (
              <div className="surface-block px-4 py-4 sm:col-span-2">
                <p className="insight-label">Fulfillment status</p>
                <p className="mt-2 text-base leading-8 text-muted">
                  Payment is confirmed. The owned report, PDF asset, or delivery path is still
                  finishing in the background, and the dashboard will continue to reflect the latest
                  saved state.
                </p>
              </div>
            ) : null}
            {result.explanationEntitlement ? (
              <div className="surface-block px-4 py-4 sm:col-span-2">
                <p className="insight-label">Guided report walkthrough</p>
                <p className="mt-2 text-base leading-8 text-muted">
                  Your psychologist explanation entitlement has been saved with the account and is
                  now marked for operational follow-up as a structured discussion of the report.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="space-y-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
              <ReportIcon className="h-5 w-5" />
            </span>
            <CardTitle className="text-[1.4rem]">View your full report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              Open the full report now. The same report will also remain available in the dashboard
              library.
            </p>
            <LinkButton
              href={result.ownedReport?.viewUrl ?? "/dashboard"}
              size="lg"
              className="w-full"
            >
              Open Full Report
            </LinkButton>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
              <LibraryIcon className="h-5 w-5" />
            </span>
            <CardTitle className="text-[1.4rem]">Open your dashboard library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              {regionConfig.supportsMembership
                ? "The dashboard now reflects owned reports, purchased bundles, recent activity, and the membership path."
                : "The dashboard now reflects owned reports, purchased bundles, recent activity, and any future guided explanation add-ons attached to those reports."}
            </p>
            <LinkButton href="/dashboard" variant="outline" size="lg" className="w-full">
              Open My Insight Library
            </LinkButton>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
              <SubscriptionIcon className="h-5 w-5" />
            </span>
            <CardTitle className="text-[1.4rem]">
              {regionConfig.supportsMembership
                ? "Broaden this into an insight library"
                : "Add a guided explanation only if more clarity would help"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              {membershipNarrative.postPurchaseDescription}
            </p>
            <div className="surface-block px-4 py-4">
              <p className="insight-label">
                {regionConfig.supportsMembership
                  ? "Membership pricing"
                  : "Available next-step pricing"}
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {regionConfig.supportsMembership ? (
                  <>
                    {pricingLabels.membershipAnnual} <span className="text-muted">or</span>{" "}
                    {pricingLabels.membershipMonthly}
                  </>
                ) : (
                  <>
                    {pricingLabels.explanationThirtyMinutes}{" "}
                    <span className="text-muted">or</span>{" "}
                    {pricingLabels.explanationSixtyMinutes}
                  </>
                )}
              </p>
            </div>
            <LinkButton href="/pricing" variant="outline" size="lg" className="w-full">
              {regionConfig.supportsMembership
                ? "Review Membership Options"
                : "Review Report And Walkthrough Options"}
            </LinkButton>
          </CardContent>
        </Card>
      </div>

      {result.ownedBundle || result.subscription ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {result.ownedBundle ? (
            <Card className="h-full">
              <CardHeader className="space-y-5">
                <Badge variant="outline">Bundle saved</Badge>
                <CardTitle className="text-[1.45rem]">{result.ownedBundle.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted">{result.ownedBundle.description}</p>
                <div className="flex flex-wrap gap-2">
                  {result.ownedBundle.includedAssessmentSlugs.map((slug) => (
                    <Badge key={slug} variant="outline">
                      {slug}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {result.subscription ? (
            <Card className="h-full">
              <CardHeader className="space-y-5">
                <Badge variant="success">
                  {regionConfig.supportsMembership ? "Membership active" : "Access record active"}
                </Badge>
                <CardTitle className="text-[1.45rem]">{result.subscription.planLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted">
                  {regionConfig.supportsMembership
                    ? "Membership now keeps plan state, unlocked assessments, broader library continuity, and future follow-up features in one place."
                    : "The same account layer can still hold broader access records later, even while the current catalog emphasizes report and walkthrough purchases."}
                </p>
                <p className="text-sm leading-7 text-muted">
                  {regionConfig.supportsMembership
                    ? `Current public membership pricing is ${pricingLabels.membershipAnnual} or ${pricingLabels.membershipMonthly}.`
                    : `Current report options center on ${pricingLabels.singleInsightReport} and ${pricingLabels.premiumDeepInsightReport}, with guided explanation options at ${pricingLabels.explanationThirtyMinutes} and ${pricingLabels.explanationSixtyMinutes}.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.subscription.unlockedAssessmentSlugs.map((slug) => (
                    <Badge key={slug} variant="outline">
                      {slug}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {result.ownedReport ? (
        <Card variant="raised">
          <CardHeader className="space-y-5">
            <Badge variant="outline">Owned report controls</Badge>
            <CardTitle className="text-[1.6rem]">
              Delivery and export actions are already attached to the saved report.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportActions
              ownedReport={result.ownedReport}
              accountEmailLabel={result.ownedReport.delivery.accountEmail}
              context="checkout_success"
              persistenceMode="database"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
