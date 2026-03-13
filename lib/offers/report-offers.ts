import { getOfferByType, getPricingLabels, getRegionConfig } from "@/lib/pricing";
import type { PurchaseType } from "@/lib/commerce/types";
import type { RegionKey } from "@/lib/region/types";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

export type ReportUnlockOffer = {
  id: string;
  offerType:
    | "single_report"
    | "premium_report"
    | "membership_annual"
    | "report_plus_explanation_30"
    | "report_plus_explanation_60";
  productType: PurchaseType;
  pricingTier:
    | "single"
    | "premium"
    | "membership"
    | "bundle"
    | "explanation";
  regionKey: RegionKey;
  currencyCode: "USD" | "INR";
  paymentProvider: "stripe" | "razorpay";
  badge: string;
  label: string;
  title: string;
  description: string;
  priceCents: number;
  priceLabel: string;
  secondaryPriceLabel?: string;
  ctaLabel: string;
  reassurance: string;
  benefits: string[];
  explanationSessionDuration?: 30 | 60;
  includedAssessments?: string[];
  includedAssessmentSlugs?: string[];
  subscriptionPlanCode?: string | null;
};

export type ReportUnlockOfferSuite = {
  primaryOffer: ReportUnlockOffer;
  premiumOffer: ReportUnlockOffer;
  membershipOffer: ReportUnlockOffer | null;
  explanationOffers: ReportUnlockOffer[];
  secondaryOffers: ReportUnlockOffer[];
  valueHighlights: string[];
  trustNotes: string[];
  storageNote: string;
  pricingNote: string;
};

export function getReportUnlockOfferSuite(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile,
  report: PremiumReport,
  regionKey: RegionKey
): ReportUnlockOfferSuite {
  const pricingLabels = getPricingLabels(regionKey);
  const region = getRegionConfig(regionKey);
  const lockedSectionTitles = report.lockedSections
    .map((section) => section.title)
    .slice(0, 4);

  const singleOffer = getOfferByType(regionKey, "single_report");
  const premiumCatalogOffer = getOfferByType(regionKey, "premium_report");
  const annualMembershipOffer = getOfferByType(regionKey, "membership_annual");
  const explanationThirtyOffer = getOfferByType(
    regionKey,
    "report_plus_explanation_30"
  );
  const explanationSixtyOffer = getOfferByType(
    regionKey,
    "report_plus_explanation_60"
  );

  if (!singleOffer || !premiumCatalogOffer) {
    throw new Error(`Missing required offer catalog entries for ${regionKey}.`);
  }

  const primaryOffer: ReportUnlockOffer = {
    id: `${assessment.slug}:single-report:${regionKey}`,
    offerType: "single_report",
    productType: "single_report",
    pricingTier: "single",
    regionKey,
    currencyCode: singleOffer.currencyCode,
    paymentProvider: singleOffer.paymentProvider,
    badge: singleOffer.shortLabel,
    label: regionKey === "india" ? "Core report access" : "Core report access",
    title:
      regionKey === "india"
        ? "Unlock Full Insight Report"
        : "Unlock Full Insight Report",
    description:
      regionKey === "india"
        ? "Access the full report built from your scored response pattern, including the deeper interpretation, practical context, friction areas, and stabilizing guidance behind the preview."
        : "Access the full report built from your scored response pattern, including the deeper interpretation, emotional context, friction areas, and stabilizing guidance already prepared behind the preview.",
    priceCents: singleOffer.priceMinor,
    priceLabel: pricingLabels.singleInsightReport,
    ctaLabel: "Unlock Full Insight Report",
    reassurance:
      "Your unlocked report is designed to stay in the dashboard for later viewing, download, and email delivery once live checkout is connected.",
    benefits: [
      "Full interpretation of your scored response pattern",
      ...lockedSectionTitles,
      "Saved library access plus download-ready report delivery"
    ].slice(0, 6)
  };

  const premiumOffer: ReportUnlockOffer = {
    id: `${assessment.slug}:premium-report:${regionKey}`,
    offerType: "premium_report",
    productType: "premium_report",
    pricingTier: "premium",
    regionKey,
    currencyCode: premiumCatalogOffer.currencyCode,
    paymentProvider: premiumCatalogOffer.paymentProvider,
    badge: premiumCatalogOffer.badge ?? "Premium report",
    label:
      regionKey === "india" ? "Deeper report interpretation" : "Expanded interpretation",
    title:
      regionKey === "india"
        ? "Upgrade To Premium Deep Insight Report"
        : "Upgrade To Premium Insight Report",
    description:
      regionKey === "india"
        ? "Choose the deeper one-time path when you want a more substantial interpretation layer and a broader practical reading of this same topic."
        : "Choose the deeper one-time path when you want a more substantial interpretation layer, broader contextual reading, and richer narrative depth from this same topic.",
    priceCents: premiumCatalogOffer.priceMinor,
    priceLabel: pricingLabels.premiumDeepInsightReport,
    secondaryPriceLabel: `${pricingLabels.singleInsightReport} core report also available`,
    ctaLabel:
      regionKey === "india"
        ? "Choose Premium Deep Report"
        : "Choose Premium Deep Report",
    reassurance:
      "The premium path is still private, dashboard-saved, and grounded in the same deterministic scoring foundation as the core report.",
    benefits: [
      "Expanded interpretation across the same scored pattern",
      "Deeper emotional and contextual reading",
      "Richer premium narrative depth prepared for future AI-enhanced sections",
      "Saved library access plus delivery-ready ownership"
    ],
    includedAssessments: [assessment.title]
  };

  const membershipOffer =
    annualMembershipOffer && region.supportsMembership
      ? ({
          id: `${assessment.slug}:membership:${regionKey}`,
          offerType: "membership_annual",
          productType: "subscription",
          pricingTier: "membership",
          regionKey,
          currencyCode: annualMembershipOffer.currencyCode,
          paymentProvider: annualMembershipOffer.paymentProvider,
          badge: annualMembershipOffer.badge ?? "Membership option",
          label: "Best for ongoing insight",
          title: "Turn this report into a broader private insight library",
          description:
            "Designed for people who expect more than one meaningful topic, want future assessments included, or want later comparison and follow-up layers instead of isolated purchases.",
          priceCents: annualMembershipOffer.priceMinor,
          priceLabel: pricingLabels.membershipAnnual ?? "",
          secondaryPriceLabel: pricingLabels.membershipMonthly
            ? `${pricingLabels.membershipMonthly} flexible access`
            : undefined,
          ctaLabel: "Choose Membership",
          reassurance:
            "Membership is optional. It makes the most sense when the preview already suggests adjacent topics, recurring patterns, or a real need for longer-term visibility.",
          benefits: [
            "Access to all 10 assessments while membership is active",
            "Full report library and dashboard history in one account view",
            "Future assessments included in the same membership path",
            "Connected-pattern recommendations across multiple reports",
            "Prepared for future follow-up prompts and report comparison narratives",
            ...resultProfile.membershipUpsell.benefits.slice(0, 1)
          ].slice(0, 5),
          includedAssessmentSlugs: resultProfile.relatedRecommendations
            .filter((item) => item.slug !== "membership")
            .map((item) => item.slug)
            .slice(0, 3),
          subscriptionPlanCode: "membership-annual"
        } satisfies ReportUnlockOffer)
      : null;

  const explanationOffers: ReportUnlockOffer[] = [];

  if (region.supportsPsychologistExplanation && explanationThirtyOffer) {
    explanationOffers.push({
      id: `${assessment.slug}:explanation-30:${regionKey}`,
      offerType: "report_plus_explanation_30",
      productType: "explanation_session",
      pricingTier: "explanation",
      regionKey,
      currencyCode: explanationThirtyOffer.currencyCode,
      paymentProvider: explanationThirtyOffer.paymentProvider,
      badge: explanationThirtyOffer.badge ?? "Guided walkthrough",
      label: "Structured report discussion",
      title: "Add Report + 30 min Psychologist Explanation",
      description:
        "Choose this if you want the full report plus a shorter guided report walkthrough focused on clarifying what the report is highlighting.",
      priceCents: explanationThirtyOffer.priceMinor,
      priceLabel: pricingLabels.explanationThirtyMinutes ?? "",
      secondaryPriceLabel: `${pricingLabels.premiumDeepInsightReport} premium report also available`,
      ctaLabel: "Choose 30 Min Explanation",
      reassurance:
        "This is positioned as a structured discussion of your report, not therapy or diagnosis.",
      benefits: [
        "Full report included",
        "30 minute guided report walkthrough",
        "Useful when you want clearer discussion of the report's main signals",
        "Saved in the same private ownership flow"
      ],
      explanationSessionDuration: 30
    });
  }

  if (region.supportsPsychologistExplanation && explanationSixtyOffer) {
    explanationOffers.push({
      id: `${assessment.slug}:explanation-60:${regionKey}`,
      offerType: "report_plus_explanation_60",
      productType: "explanation_session",
      pricingTier: "explanation",
      regionKey,
      currencyCode: explanationSixtyOffer.currencyCode,
      paymentProvider: explanationSixtyOffer.paymentProvider,
      badge: explanationSixtyOffer.badge ?? "Extended walkthrough",
      label: "Longer report walkthrough",
      title: "Add Report + 60 min Psychologist Explanation",
      description:
        "Choose this if you want the full report plus more time for a guided report walkthrough and structured clarification of the pattern read.",
      priceCents: explanationSixtyOffer.priceMinor,
      priceLabel: pricingLabels.explanationSixtyMinutes ?? "",
      secondaryPriceLabel: `${pricingLabels.explanationThirtyMinutes} shorter walkthrough also available`,
      ctaLabel: "Choose 60 Min Explanation",
      reassurance:
        "This remains a guided report walkthrough rather than a diagnostic or clinical service.",
      benefits: [
        "Full report included",
        "60 minute guided report walkthrough",
        "More time for structured questions and interpretation clarity",
        "Saved in the same private ownership flow"
      ],
      explanationSessionDuration: 60
    });
  }

  return {
    primaryOffer,
    premiumOffer,
    membershipOffer,
    explanationOffers,
    secondaryOffers: [premiumOffer, ...(membershipOffer ? [membershipOffer] : []), ...explanationOffers],
    valueHighlights: [
      "Private and confidential",
      "Structured for reflection, not diagnosis",
      "Built from scored response patterns, not a single answer",
      "Designed for saved access, download, and account delivery"
    ],
    trustNotes:
      regionKey === "india"
        ? [
            `The preview shows the strongest pattern signals first. The ${pricingLabels.singleInsightReport} report expands that into a fuller reading, while the ${pricingLabels.premiumDeepInsightReport} path goes deeper into interpretation.`,
            "Guided psychologist explanation options are available only in India and are positioned as structured report walkthroughs.",
            "Deterministic scoring remains the logic layer underneath the premium narrative report."
          ]
        : [
            `The preview shows the strongest pattern signals first. The ${pricingLabels.singleInsightReport} report expands that into a full reading, while the ${pricingLabels.premiumDeepInsightReport} path goes deeper into interpretation.`,
            "Access is designed to stay available in the dashboard rather than disappearing after one session.",
            "Deterministic scoring remains the logic layer underneath the premium narrative report."
          ],
    storageNote:
      "After live checkout is connected, the report will be stored in the account library with dashboard access, delivery history, and PDF availability.",
    pricingNote:
      regionKey === "india"
        ? `Choose ${pricingLabels.singleInsightReport} for the core report, ${pricingLabels.premiumDeepInsightReport} for the deeper report, or ${pricingLabels.explanationThirtyMinutes} / ${pricingLabels.explanationSixtyMinutes} when a guided report walkthrough would be useful.`
        : `Choose ${pricingLabels.singleInsightReport} when one topic is active, ${pricingLabels.premiumDeepInsightReport} when you want a deeper one-time interpretation, or ${pricingLabels.membershipAnnual} for the strongest long-term value. ${pricingLabels.membershipMonthly} stays available as the flexible option.`
  };
}
