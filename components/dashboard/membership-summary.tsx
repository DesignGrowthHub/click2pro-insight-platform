"use client";

import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Assessment } from "@/lib/assessments";
import type { Subscription } from "@/lib/persistence";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparkIcon, SubscriptionIcon } from "@/components/ui/icons";

function formatNullableDate(date: string | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

type MembershipSummaryProps = {
  subscription: Subscription;
  benefits: string[];
  unlockedAssessments: Assessment[];
};

export function MembershipSummary({
  subscription,
  benefits,
  unlockedAssessments
}: MembershipSummaryProps) {
  const { regionKey, membershipContent, pricingLabels } = useCommerceRegion();
  const content = membershipContent;
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Card variant="raised" className="h-full">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
              <SubscriptionIcon className="h-5 w-5" />
            </span>
            <Badge variant={isActive ? "success" : "outline"}>
              {isActive ? "Membership active" : "Upgrade available"}
            </Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-[1.7rem]">{subscription.planLabel}</CardTitle>
            <p className="body-sm max-w-2xl">
              {isActive
                ? content.membershipNarrative.dashboardActiveDescription
                : content.membershipNarrative.dashboardInactiveDescription}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Plan status</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {subscription.status}
              </p>
            </div>
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Renewal date</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {formatNullableDate(subscription.renewalDate)}
              </p>
            </div>
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Membership mode</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {subscription.billingInterval}
              </p>
            </div>
          </div>

          {regionKey === "india" && !isActive ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-block-strong px-5 py-5">
                <p className="insight-label">30 min explanation</p>
                <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-foreground">
                  {pricingLabels.explanationThirtyMinutes}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Structured report walkthrough for users who want added clarity after purchase.
                </p>
              </div>
              <div className="surface-block px-5 py-5">
                <p className="insight-label">60 min explanation</p>
                <p className="mt-2 text-[1.5rem] font-semibold tracking-tight text-foreground">
                  {pricingLabels.explanationSixtyMinutes}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Longer guided report walkthrough when more discussion time feels useful.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-block-strong px-5 py-5">
                <p className="insight-label">Annual membership</p>
                <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-foreground">
                  {pricingLabels.membershipAnnual}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Best value when you want a long-term report library and broader pattern visibility.
                </p>
              </div>
              <div className="surface-block px-5 py-5">
                <p className="insight-label">Monthly membership</p>
                <p className="mt-2 text-[1.5rem] font-semibold tracking-tight text-foreground">
                  {pricingLabels.membershipMonthly}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Flexible access when recurring use matters, but annual still is not the right fit yet.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-block px-5 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Unlocked now</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                These are the current benefits visible in your account.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-primary/12 bg-primary/10 px-3.5 py-2 text-sm text-foreground"
                  >
                    {benefit}
                  </span>
                ))}
                {unlockedAssessments.map((assessment) => (
                  <span
                    key={assessment.slug}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-foreground"
                  >
                    {assessment.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="surface-block-strong px-5 py-5">
              <p className="insight-label">Prepared next</p>
              <div className="mt-3 space-y-3">
                {content.membershipFutureLayers.slice(0, 2).map((item) => (
                  <div key={item.title}>
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Report credits placeholder
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {subscription.reportCreditsRemaining}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reserved for future recurring entitlements.
              </p>
            </div>
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Why membership fits
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Most useful when more than one topic is active or when reports are likely to connect.
              </p>
            </div>
          </div>

          <LinkButton href="/pricing" size="xl" className="w-full sm:w-auto">
            {regionKey === "india" && !isActive
              ? "Review Guided Explanation Options"
              : isActive
                ? "Review Membership Details"
                : "Explore Membership Options"}
          </LinkButton>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        {content.membershipDashboardPillars.map((item) => (
          <Card key={item.title} className="h-full">
            <CardHeader className="space-y-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-success/18 bg-success/10 text-success">
                <SparkIcon className="h-5 w-5" />
              </span>
              <CardTitle className="text-[1.2rem]">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
