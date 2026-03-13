"use client";

import { useCommerceRegion } from "@/components/region/commerce-region-provider";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type SubscriptionUpsellProps = {
  title?: string;
  note: string;
  benefits?: string[];
  tone?: "default" | "subdued";
};

export function SubscriptionUpsell({
  title,
  note,
  benefits = [],
  tone = "default"
}: SubscriptionUpsellProps) {
  const { membershipContent, pricingLabels, regionKey } = useCommerceRegion();
  const membershipNarrative = membershipContent.membershipNarrative;
  const membershipPlanCards = membershipContent.membershipPlanCards;
  const membershipFutureLayers = membershipContent.membershipFutureLayers;
  const isSubdued = tone === "subdued";

  const annualMembershipPlan = membershipPlanCards.find(
    (plan) => plan.id === "annual-membership"
  );
  const monthlyMembershipPlan = membershipPlanCards.find(
    (plan) => plan.id === "monthly-membership"
  );
  const explanationPlans = membershipPlanCards.filter((plan) =>
    ["report-plus-30", "report-plus-60"].includes(plan.id)
  );

  const displayBenefits =
    regionKey === "india"
      ? [
          "Saved report library remains available after purchase",
          "Guided report walkthroughs can add structured explanation when useful",
          "Download and email delivery continue through the same ownership path",
          ...benefits
        ]
      : [
          "Access to all 10 assessments while membership is active",
          "Full report library and dashboard history",
          "Future assessments included in the platform",
          "Cross-insight recommendations across related patterns",
          ...benefits
        ];

  const uniqueBenefits = displayBenefits
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, isSubdued ? 3 : 5);

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline">
            {regionKey === "india" ? "Guided explanation path" : "Membership path"}
          </Badge>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 text-primary">
            <SubscriptionIcon className="h-5 w-5" />
          </span>
        </div>
        <CardTitle className={cn("text-[1.55rem]", isSubdued && "text-[1.42rem]")}>
          {title ?? membershipNarrative.postPurchaseTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {regionKey === "india" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {explanationPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  isSubdued ? "surface-block" : "surface-block-strong",
                  "px-4 py-4"
                )}
              >
                <p className="insight-label">{plan.badge}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {plan.name}
                </p>
                <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-foreground">
                  {plan.price}
                  <span className="ml-2 text-base font-medium text-muted">
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {plan.supportingNote}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {annualMembershipPlan ? (
              <div
                className={cn(
                  isSubdued ? "surface-block" : "surface-block-strong",
                  "px-4 py-4"
                )}
              >
                <p className="insight-label">{membershipNarrative.annualBadge}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {annualMembershipPlan.name}
                </p>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                  {annualMembershipPlan.price}
                  <span className="ml-2 text-base font-medium text-muted">
                    {annualMembershipPlan.cadence}
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-primary">
                  {pricingLabels.annualBadge}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {annualMembershipPlan.supportingNote}
                </p>
              </div>
            ) : null}
            {monthlyMembershipPlan ? (
              <div className="surface-block px-4 py-4">
                <p className="insight-label">{monthlyMembershipPlan.badge}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {monthlyMembershipPlan.name}
                </p>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                  {monthlyMembershipPlan.price}
                  <span className="ml-2 text-base font-medium text-muted">
                    {monthlyMembershipPlan.cadence}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {monthlyMembershipPlan.supportingNote}
                </p>
              </div>
            ) : null}
          </div>
        )}
        <div className="grid gap-3">
          {uniqueBenefits.map((item) => (
            <div
              key={item}
              className="surface-block px-4 py-4 text-base leading-8 text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="surface-block px-4 py-4">
          <p className={cn("text-base leading-8 text-muted", isSubdued && "text-sm sm:text-[0.98rem]")}>
            {note}
          </p>
          {!isSubdued ? (
            <p className="mt-3 text-sm leading-7 text-muted">
              {membershipNarrative.postPurchaseDescription}
            </p>
          ) : null}
        </div>
        {!isSubdued ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {membershipFutureLayers.slice(0, 2).map((item) => (
              <div key={item.title} className="surface-block px-4 py-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        ) : null}
        <LinkButton href="/pricing" variant="outline" size="lg">
          {regionKey === "india" ? "Review Report And Walkthrough Options" : "Review Membership Options"}
        </LinkButton>
      </CardContent>
    </Card>
  );
}
