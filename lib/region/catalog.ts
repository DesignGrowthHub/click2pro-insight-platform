import type {
  CommerceOfferType,
  OfferCatalogEntry,
  RegionCommerceConfig,
  RegionKey,
  RegionPricingLabels
} from "@/lib/region/types";

export const REGION_PREFERENCE_COOKIE = "click2pro_insight_region";
export const DEV_REGION_OVERRIDE_COOKIE = "click2pro_insight_dev_region";

const regionConfigs: Record<RegionKey, RegionCommerceConfig> = {
  international: {
    key: "international",
    label: "International",
    countryBucket: "international",
    locale: "en-US",
    currencyCode: "USD",
    paymentProvider: "stripe",
    annualMembershipEmphasis: true,
    supportsMembership: true,
    supportsPsychologistExplanation: false
  },
  india: {
    key: "india",
    label: "India",
    countryBucket: "india",
    locale: "en-IN",
    currencyCode: "INR",
    paymentProvider: "razorpay",
    annualMembershipEmphasis: false,
    supportsMembership: false,
    supportsPsychologistExplanation: true
  }
};

const offerCatalog: Record<RegionKey, OfferCatalogEntry[]> = {
  international: [
    {
      id: "single_report",
      regionKey: "international",
      title: "Single Insight Report",
      shortLabel: "Single report",
      description: "Access one full report.",
      productType: "single_report",
      currencyCode: "USD",
      paymentProvider: "stripe",
      priceMinor: 4900,
      featured: false,
      badge: "Focused",
      supportingNote:
        "Best when one question is active and you want one complete interpretation.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: true,
        dashboard: true,
        recommendations: true
      }
    },
    {
      id: "premium_report",
      regionKey: "international",
      title: "Premium Deep Insight Report",
      shortLabel: "Premium report",
      description: "Includes expanded interpretation and deeper insights.",
      productType: "premium_report",
      currencyCode: "USD",
      paymentProvider: "stripe",
      priceMinor: 9900,
      featured: false,
      badge: "Expanded",
      supportingNote:
        "Better when the same topic already matters enough that a deeper one-time read feels worthwhile.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: true,
        dashboard: true,
        recommendations: false
      }
    },
    {
      id: "membership_annual",
      regionKey: "international",
      title: "Membership",
      shortLabel: "Annual membership",
      description:
        "Access to all 10 assessments, full report library, future insights, and ongoing visibility across connected patterns.",
      productType: "subscription",
      currencyCode: "USD",
      paymentProvider: "stripe",
      priceMinor: 19900,
      cadenceLabel: "per year",
      secondaryOfferId: "membership_monthly",
      membershipPlan: "annual",
      featured: true,
      badge: "Recommended",
      supportingNote:
        "The strongest value for people who want more than one report or expect the library to stay useful over time.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: false,
        dashboard: true,
        recommendations: false
      }
    },
    {
      id: "membership_monthly",
      regionKey: "international",
      title: "Monthly Membership",
      shortLabel: "Monthly membership",
      description: "Flexible recurring access.",
      productType: "subscription",
      currencyCode: "USD",
      paymentProvider: "stripe",
      priceMinor: 2900,
      cadenceLabel: "per month",
      membershipPlan: "monthly",
      featured: false,
      badge: "Flexible",
      supportingNote:
        "Useful when recurring access matters, but annual still is not the right fit.",
      visibility: {
        pricingPage: false,
        unlockFlow: false,
        assessmentCue: false,
        dashboard: true,
        recommendations: false
      }
    }
  ],
  india: [
    {
      id: "single_report",
      regionKey: "india",
      title: "Insight Report",
      shortLabel: "Insight report",
      description: "Access one full report in a clear, practical format.",
      productType: "single_report",
      currencyCode: "INR",
      paymentProvider: "razorpay",
      priceMinor: 99900,
      featured: false,
      badge: "Core",
      supportingNote:
        "A focused first step when one question already feels active and you want a structured interpretation.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: true,
        dashboard: true,
        recommendations: true
      }
    },
    {
      id: "premium_report",
      regionKey: "india",
      title: "Premium Deep Insight Report",
      shortLabel: "Premium report",
      description: "Includes deeper interpretation and broader contextual reading.",
      productType: "premium_report",
      currencyCode: "INR",
      paymentProvider: "razorpay",
      priceMinor: 299900,
      featured: true,
      badge: "Expanded",
      supportingNote:
        "Best when the topic already matters enough that a more developed report feels useful from the start.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: true,
        dashboard: true,
        recommendations: false
      }
    },
    {
      id: "report_plus_explanation_30",
      regionKey: "india",
      title: "Report + 30 min Psychologist Explanation",
      shortLabel: "30 min explanation",
      description:
        "Includes the report plus a guided walkthrough with a psychologist focused on structured discussion of what the report is highlighting.",
      productType: "explanation_session",
      currencyCode: "INR",
      paymentProvider: "razorpay",
      priceMinor: 399900,
      explanationSessionDuration: 30,
      featured: false,
      badge: "Guided walkthrough",
      supportingNote:
        "Positioned as a calm report walkthrough, not therapy or diagnosis.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: false,
        dashboard: true,
        recommendations: false
      }
    },
    {
      id: "report_plus_explanation_60",
      regionKey: "india",
      title: "Report + 60 min Psychologist Explanation",
      shortLabel: "60 min explanation",
      description:
        "Includes the report plus a longer guided report walkthrough for people who want more time to ask questions and clarify the pattern read.",
      productType: "explanation_session",
      currencyCode: "INR",
      paymentProvider: "razorpay",
      priceMinor: 599900,
      explanationSessionDuration: 60,
      featured: false,
      badge: "Extended walkthrough",
      supportingNote:
        "Designed for deeper structured discussion of the report without positioning it as clinical care.",
      visibility: {
        pricingPage: true,
        unlockFlow: true,
        assessmentCue: false,
        dashboard: true,
        recommendations: false
      }
    }
  ]
};

export function getRegionConfig(regionKey: RegionKey) {
  return regionConfigs[regionKey];
}

export function getOfferCatalog(regionKey: RegionKey) {
  return offerCatalog[regionKey];
}

export function getOfferByType(regionKey: RegionKey, offerType: CommerceOfferType) {
  return offerCatalog[regionKey].find((offer) => offer.id === offerType) ?? null;
}

export function formatMoney(minor: number, currency: "USD" | "INR", locale: "en-US" | "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(minor / 100);
}

export function getPricingLabels(regionKey: RegionKey): RegionPricingLabels {
  const region = getRegionConfig(regionKey);
  const singleOffer = getOfferByType(regionKey, "single_report");
  const premiumOffer = getOfferByType(regionKey, "premium_report");
  const monthlyMembership = getOfferByType(regionKey, "membership_monthly");
  const annualMembership = getOfferByType(regionKey, "membership_annual");
  const explanationThirty = getOfferByType(regionKey, "report_plus_explanation_30");
  const explanationSixty = getOfferByType(regionKey, "report_plus_explanation_60");

  return {
    singleInsightReport: singleOffer
      ? formatMoney(singleOffer.priceMinor, singleOffer.currencyCode, region.locale)
      : "",
    premiumDeepInsightReport: premiumOffer
      ? formatMoney(premiumOffer.priceMinor, premiumOffer.currencyCode, region.locale)
      : "",
    membershipMonthly: monthlyMembership
      ? `${formatMoney(monthlyMembership.priceMinor, monthlyMembership.currencyCode, region.locale)}/month`
      : null,
    membershipAnnual: annualMembership
      ? `${formatMoney(annualMembership.priceMinor, annualMembership.currencyCode, region.locale)}/year`
      : null,
    membershipMonthlyPlain: monthlyMembership
      ? formatMoney(monthlyMembership.priceMinor, monthlyMembership.currencyCode, region.locale)
      : null,
    membershipAnnualPlain: annualMembership
      ? formatMoney(annualMembership.priceMinor, annualMembership.currencyCode, region.locale)
      : null,
    explanationThirtyMinutes: explanationThirty
      ? formatMoney(explanationThirty.priceMinor, explanationThirty.currencyCode, region.locale)
      : null,
    explanationSixtyMinutes: explanationSixty
      ? formatMoney(explanationSixty.priceMinor, explanationSixty.currencyCode, region.locale)
      : null,
    annualBadge: region.annualMembershipEmphasis ? "Best value" : null,
    monthlyBadge: region.supportsMembership ? "Flexible access" : null
  };
}

export function getAdminPricingReference() {
  return (Object.keys(regionConfigs) as RegionKey[]).flatMap((regionKey) => {
    const region = getRegionConfig(regionKey);

    return getOfferCatalog(regionKey)
      .filter((offer) => offer.visibility.pricingPage || offer.id === "membership_monthly")
      .map((offer) => ({
        region: region.label,
        label: offer.title,
        value: formatMoney(offer.priceMinor, offer.currencyCode, region.locale),
        note: `${offer.paymentProvider} oriented ${offer.shortLabel.toLowerCase()} offer.`
      }));
  });
}
