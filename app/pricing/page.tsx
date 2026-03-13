import { PricingCheckoutButton } from "@/components/pricing/pricing-checkout-button";
import { PricingCard } from "@/components/pricing/pricing-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CtaBlock } from "@/components/ui/cta-block";
import { LinkButton } from "@/components/ui/button";
import { SectionShell } from "@/components/ui/section-shell";
import { assessments } from "@/lib/assessments";
import {
  getMembershipContent,
  type MembershipPlanCard
} from "@/lib/membership/content";
import { getOfferByType } from "@/lib/pricing";
import { getServerCommerceRegionContext } from "@/lib/region/server";

type PricingPageProps = {
  searchParams?: Promise<{
    assessment?: string;
  }>;
};

export default async function PricingPage({
  searchParams
}: PricingPageProps) {
  const params = (await searchParams) ?? {};
  const regionContext = await getServerCommerceRegionContext();
  const {
    membershipNarrative,
    membershipPlanCards
  } = getMembershipContent(regionContext.regionKey);
  const singleReportPlan = membershipPlanCards.find((plan) => plan.id === "single-report");
  const premiumReportPlan = membershipPlanCards.find((plan) => plan.id === "premium-report");
  const annualMembershipPlan = membershipPlanCards.find(
    (plan) => plan.id === "annual-membership"
  );
  const monthlyMembershipPlan = membershipPlanCards.find(
    (plan) => plan.id === "monthly-membership"
  );
  const explanationThirtyPlan = membershipPlanCards.find(
    (plan) => plan.id === "report-plus-30"
  );
  const explanationSixtyPlan = membershipPlanCards.find(
    (plan) => plan.id === "report-plus-60"
  );
  const checkoutAssessment =
    assessments.find((assessment) => assessment.slug === params.assessment) ??
    assessments.find((assessment) => assessment.featured) ??
    assessments[0];
  const checkoutAssessmentContext = checkoutAssessment
    ? {
        slug: checkoutAssessment.slug,
        title: checkoutAssessment.title,
        topic: checkoutAssessment.category
      }
    : null;
  const singleReportOffer = getOfferByType(regionContext.regionKey, "single_report");
  const premiumReportOffer = getOfferByType(regionContext.regionKey, "premium_report");
  const annualMembershipOffer = getOfferByType(regionContext.regionKey, "membership_annual");
  const explanationThirtyOffer = getOfferByType(
    regionContext.regionKey,
    "report_plus_explanation_30"
  );

  const publicPricingCards = [
    singleReportPlan && singleReportOffer
      ? {
          ...singleReportPlan,
          checkoutConfig: {
            offerId: singleReportOffer.id,
            offerTitle: singleReportOffer.title,
            purchaseType: singleReportOffer.productType,
            priceCents: singleReportOffer.priceMinor,
            currency: singleReportOffer.currencyCode,
            paymentProvider: singleReportOffer.paymentProvider,
            regionKey: regionContext.regionKey
          }
        }
      : null,
    premiumReportPlan && premiumReportOffer
      ? {
          ...premiumReportPlan,
          checkoutConfig: {
            offerId: premiumReportOffer.id,
            offerTitle: premiumReportOffer.title,
            purchaseType: premiumReportOffer.productType,
            priceCents: premiumReportOffer.priceMinor,
            currency: premiumReportOffer.currencyCode,
            paymentProvider: premiumReportOffer.paymentProvider,
            regionKey: regionContext.regionKey
          }
        }
      : null,
    regionContext.supportsMembership
      ? null
      : explanationThirtyOffer
        ? {
          id: "psychologist-explanation",
          name: "Psychologist Explanation Session",
          price: explanationThirtyPlan?.price ?? "",
          cadence: "30 min",
          secondaryPrice: explanationSixtyPlan?.price,
          secondaryCadence: explanationSixtyPlan ? "60 min" : undefined,
          description:
            "A guided report walkthrough when written insight alone does not feel like enough.",
          features: [
            "Your full report remains the foundation",
            "Structured discussion of the report",
            "Choose a 30 or 60 minute session"
          ],
          cta: "Book Explanation Session",
          href: "/assessments",
          badge: "Guided walkthrough",
          comparisonLabel: "After the report",
          checkoutConfig: {
            offerId: explanationThirtyOffer.id,
            offerTitle: explanationThirtyOffer.title,
            purchaseType: explanationThirtyOffer.productType,
            priceCents: explanationThirtyOffer.priceMinor,
            currency: explanationThirtyOffer.currencyCode,
            paymentProvider: explanationThirtyOffer.paymentProvider,
            regionKey: regionContext.regionKey
          }
        }
        : null
  ].filter(Boolean) as MembershipPlanCard[];

  return (
    <main>
      <SectionShell className="pb-8 pt-10 sm:pt-14">
        <div className="space-y-4">
          <Badge variant="accent">Pricing</Badge>
          <div className="space-y-3">
            <h1 className="page-title max-w-4xl">
              Choose the clearest next step.
            </h1>
            <p className="body-md reading-column-tight max-w-3xl">
              {regionContext.supportsMembership
                ? "Start with one report if one issue is active. Choose membership only if you want broader access over time."
                : "Choose the report depth first, then add a guided explanation session only if you want a clearer structured discussion afterward."}
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Plans"
        title="Choose what fits best right now."
        description={
          regionContext.supportsMembership
            ? "Most people should begin with one report. Membership is for broader ongoing access."
            : "Choose the report depth first. Guided explanation is the calmer follow-up option."
        }
      >
        <div
          className={
            regionContext.supportsMembership
              ? "grid gap-5 md:grid-cols-2 xl:grid-cols-2"
              : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {publicPricingCards.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              assessmentContext={checkoutAssessmentContext ?? undefined}
              callbackUrl={
                checkoutAssessment
                  ? `/pricing?assessment=${encodeURIComponent(checkoutAssessment.slug)}`
                  : "/pricing"
              }
            />
          ))}
        </div>
      </SectionShell>

      {regionContext.supportsMembership && annualMembershipPlan ? (
        <SectionShell
          eyebrow="Broader access"
          title="Need more than one report?"
          description="Membership keeps multiple reports, future assessments, and your private library in one place."
          variant="subtle"
      >
          <Card variant="raised" className="mx-auto max-w-4xl overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="accent">{annualMembershipPlan.badge}</Badge>
                <Badge variant="outline">Best value</Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-[1.9rem]">
                  {annualMembershipPlan.name}
                </CardTitle>
                <p className="body-md reading-column-tight max-w-2xl">
                  One membership for broader pattern visibility and a private report library that stays useful over time.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <div className="surface-block-strong max-w-md px-5 py-5">
                  <div className="flex items-end gap-2">
                    <span className="text-[2.6rem] font-semibold tracking-tight text-foreground">
                      {annualMembershipPlan.price}
                    </span>
                    <span className="pb-1 text-base text-muted">
                      {annualMembershipPlan.cadence}
                    </span>
                  </div>
                  {monthlyMembershipPlan ? (
                    <p className="mt-3 text-sm leading-7 text-muted">
                      Flexible option: {monthlyMembershipPlan.price} {monthlyMembershipPlan.cadence}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Access to all core assessments",
                    "Full report library in one place",
                    "Future assessments included while active"
                  ].map((item) => (
                    <div key={item} className="surface-block px-4 py-4 text-sm leading-7 text-muted">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                {annualMembershipOffer && checkoutAssessmentContext ? (
                  <PricingCheckoutButton
                    label="Start Membership"
                    size="xl"
                    assessmentContext={checkoutAssessmentContext}
                    checkoutConfig={{
                      offerId: annualMembershipOffer.id,
                      offerTitle: annualMembershipOffer.title,
                      purchaseType: annualMembershipOffer.productType,
                      priceCents: annualMembershipOffer.priceMinor,
                      currency: annualMembershipOffer.currencyCode,
                      paymentProvider: annualMembershipOffer.paymentProvider,
                      regionKey: regionContext.regionKey,
                      subscriptionPlanCode: annualMembershipOffer.membershipPlan
                        ? `membership-${annualMembershipOffer.membershipPlan}`
                        : "membership-annual"
                    }}
                    callbackUrl={
                      checkoutAssessment
                        ? `/pricing?assessment=${encodeURIComponent(checkoutAssessment.slug)}`
                        : "/pricing"
                    }
                  />
                ) : (
                  <LinkButton href={annualMembershipPlan.href} size="xl">
                    Start Membership
                  </LinkButton>
                )}
                <p className="text-sm leading-7 text-muted">
                  Best when more than one topic matters.
                </p>
              </div>
            </CardContent>
          </Card>
        </SectionShell>
      ) : null}

      <SectionShell className="pt-0">
        <CtaBlock
          eyebrow="Next step"
          title="Choose a report, then pick the assessment that fits your issue."
          description="Start with the report depth that matches what you need, then move into the assessment that fits your issue."
          actions={
            <>
              <LinkButton href="/assessments" size="xl">
                Browse Assessments
              </LinkButton>
            </>
          }
        />
      </SectionShell>
    </main>
  );
}
