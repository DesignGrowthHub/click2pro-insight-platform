import { getOfferByType, getPricingLabels, getRegionConfig } from "@/lib/pricing";
import type { RegionKey } from "@/lib/region/types";

type PricingCheckoutConfig = {
  offerId: string;
  offerTitle: string;
  purchaseType:
    | "single_report"
    | "premium_report"
    | "bundle"
    | "subscription"
    | "explanation_session";
  priceCents: number;
  currency: "USD" | "INR";
  paymentProvider: "stripe" | "razorpay";
  regionKey: RegionKey;
  subscriptionPlanCode?: string | null;
};

export type MembershipPlanCard = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  secondaryPrice?: string;
  secondaryCadence?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  badge: string;
  featured?: boolean;
  supportingNote?: string;
  comparisonLabel?: string;
  checkoutConfig?: PricingCheckoutConfig;
};

export type MembershipBenefitCard = {
  title: string;
  description: string;
};

export type MembershipNarrative = {
  homepageTitle: string;
  homepageDescription: string;
  pricingTitle: string;
  pricingDescription: string;
  annualRecommendation: string;
  dashboardActiveDescription: string;
  dashboardInactiveDescription: string;
  postPurchaseTitle: string;
  postPurchaseDescription: string;
  libraryBadge: string;
  annualBadge: string;
};

type MembershipContentBundle = {
  membershipHomepageBenefits: MembershipBenefitCard[];
  membershipValuePillars: MembershipBenefitCard[];
  membershipDashboardPillars: MembershipBenefitCard[];
  membershipFutureLayers: MembershipBenefitCard[];
  membershipPlanCards: MembershipPlanCard[];
  membershipNarrative: MembershipNarrative;
};

export function getMembershipContent(regionKey: RegionKey): MembershipContentBundle {
  const pricingLabels = getPricingLabels(regionKey);
  const region = getRegionConfig(regionKey);

  if (regionKey === "india") {
    return {
      membershipHomepageBenefits: [
        {
          title: "Clear pricing",
          description:
            "Pricing stays practical and readable so users can choose the report depth or walkthrough path without hidden complexity."
        },
        {
          title: "Saved report library",
          description:
            "Purchased reports still stay in one private library, so return access remains simple after the first unlock."
        },
        {
          title: "Guided report walkthroughs",
          description:
            "When a user wants more clarity, psychologist explanation sessions can appear as structured report walkthroughs rather than generic upsells."
        },
        {
          title: "Prepared for secure checkout",
          description:
            "The offer layer is prepared for region-specific payment flows without changing the product structure later."
        }
      ],
      membershipValuePillars: [
        {
          title: "Core report first, explanation only when useful",
          description:
            "The main report remains the primary product. Guided explanation is there when someone wants help understanding the report more clearly."
        },
        {
          title: "Practical and clarity-oriented",
          description:
            "This offer structure avoids diagnostic positioning and keeps the value centered on deeper interpretation and structured discussion."
        },
        {
          title: "Ready for guided follow-up later",
          description:
            "The same architecture can later support scheduling, payment confirmation, and delivery notes for explanation sessions."
        }
      ],
      membershipDashboardPillars: [
        {
          title: "Private library continuity",
          description:
            "Owned reports remain visible in one private dashboard instead of being tied to a single session."
        },
        {
          title: "Guided walkthrough readiness",
          description:
            "Explanation sessions can later attach to reports without changing the report ownership layer."
        },
        {
          title: "Practical delivery path",
          description:
            "PDF and email delivery can stay part of the same ownership layer while explanation add-ons remain optional."
        },
        {
          title: "Calm commercial framing",
          description:
            "The offer structure stays focused on clarity, structure, and report usefulness rather than urgency."
        }
      ],
      membershipFutureLayers: [
        {
          title: "Guided report walkthrough booking",
          description:
            "A later step can confirm available slots and attach the selected explanation session directly to the report purchase."
        },
        {
          title: "Walkthrough follow-up notes",
          description:
            "Future delivery can include a structured summary of the report discussion without changing the core report format."
        },
        {
          title: "Region-aware delivery actions",
          description:
            "The same ownership record can later show explanation-session status, confirmation details, and report delivery in one place."
        },
        {
          title: "Broader India offer expansion",
          description:
            "The region layer can support future pricing experiments without duplicating business logic across the UI."
        }
      ],
      membershipPlanCards: [
        {
          id: "single-report",
          name: "Insight Report",
          price: pricingLabels.singleInsightReport,
          cadence: "one-time",
          badge: "Core",
          description:
            "One full report for one pattern that already feels active.",
          features: [
            "One full insight report",
            "Saved in your dashboard after purchase",
            "Download and email delivery paths",
            "Best for one clearly defined question"
          ],
          cta: "Buy Insight Report",
          href: "/assessments",
          comparisonLabel: "Core entry point"
        },
        {
          id: "premium-report",
          name: "Premium Deep Insight Report",
          price: pricingLabels.premiumDeepInsightReport,
          cadence: "one-time",
          badge: "Expanded",
          featured: true,
          description:
            "A deeper report with broader interpretation on the same topic.",
          features: [
            "Expanded interpretation and deeper contextual insight",
            "Broader report depth across the same topic",
            "Saved in the same private dashboard library",
            "Best when one question matters enough that a deeper read is useful"
          ],
          cta: "Buy Premium Report",
          href: "/assessments",
          comparisonLabel: "Deeper one-time access"
        },
        {
          id: "report-plus-30",
          name: "Report + 30 min Psychologist Explanation",
          price: pricingLabels.explanationThirtyMinutes ?? "",
          cadence: "one-time",
          badge: "Guided walkthrough",
          description:
            "A shorter guided report walkthrough when you want added clarity.",
          features: [
            "Full report included",
            "30 minute guided report walkthrough",
            "Useful when you want added clarity around the report",
            "Positioned as a structured discussion, not therapy"
          ],
          cta: "Book Explanation Session",
          href: "/assessments",
          comparisonLabel: "Added explanation"
        },
        {
          id: "report-plus-60",
          name: "Report + 60 min Psychologist Explanation",
          price: pricingLabels.explanationSixtyMinutes ?? "",
          cadence: "one-time",
          badge: "Extended walkthrough",
          description:
            "A longer guided report walkthrough with more time for discussion.",
          features: [
            "Full report included",
            "60 minute guided report walkthrough",
            "More time for structured questions about the report",
            "Still positioned as explanation, not diagnosis"
          ],
          cta: "Book Explanation Session",
          href: "/assessments",
          comparisonLabel: "Longest guided option"
        }
      ],
      membershipNarrative: {
        homepageTitle:
          "Choose report depth first, then add a guided explanation only if it would be useful.",
        homepageDescription:
          `Start with the core report at ${pricingLabels.singleInsightReport}, move into the deeper premium report at ${pricingLabels.premiumDeepInsightReport}, and add a psychologist explanation session only if a structured report walkthrough would help.`,
        pricingTitle:
          "Choose between the core report, the deeper premium report, and guided report walkthrough options.",
        pricingDescription:
          "This offer structure is built for clarity: one focused report, one deeper premium path, and optional psychologist explanation sessions that help users discuss the report more clearly if they want that added layer.",
        annualRecommendation:
          "This path focuses on report depth and optional guided explanation sessions instead of membership.",
        dashboardActiveDescription:
          "The report library remains the primary ownership layer. Guided explanation sessions can later attach to that same library without changing how reports are stored.",
        dashboardInactiveDescription:
          `You can move from the core report to a deeper premium report or an optional psychologist explanation session at ${pricingLabels.explanationThirtyMinutes} or ${pricingLabels.explanationSixtyMinutes}.`,
        postPurchaseTitle:
          "If the report feels useful but you want more clarity, guided explanation options are available.",
        postPurchaseDescription:
          `You can add a 30 minute Psychologist Explanation Session for ${pricingLabels.explanationThirtyMinutes} or a 60 minute session for ${pricingLabels.explanationSixtyMinutes}. These are structured report walkthroughs, not therapy or diagnosis.`,
        libraryBadge: "Report library",
        annualBadge: "Guided walkthrough options"
      }
    };
  }

  const singleReport = getOfferByType(regionKey, "single_report");
  const premiumReport = getOfferByType(regionKey, "premium_report");
  const annualMembership = getOfferByType(regionKey, "membership_annual");
  const monthlyMembership = getOfferByType(regionKey, "membership_monthly");

  return {
    membershipHomepageBenefits: [
      {
        title: "Full insight library access",
        description:
          "Membership is for readers who already know one report will not be the whole picture. It keeps all 10 launch assessments available without starting over each time."
      },
      {
        title: "Saved report history",
        description:
          "Reports stay in one private library, so the platform becomes easier to return to when the same pattern resurfaces in a different context."
      },
      {
        title: "Future assessments included",
        description:
          "New assessment releases can sit inside the same membership layer instead of creating a new purchase decision every time a related topic appears."
      },
      {
        title: "Connected-pattern visibility",
        description:
          "Membership is designed for people who want a broader view across relationships, identity, stress, self-pressure, and future recurring themes."
      }
    ],
    membershipValuePillars: [
      {
        title: "Better than isolated one-time unlocks",
        description:
          "A single report can clarify one active pattern. Membership is better when you expect overlap, repetition, or more than one meaningful topic."
      },
      {
        title: "Annual membership compounds quietly",
        description:
          "The annual path is the clearest fit for ongoing use because it keeps the library intact, removes repeated repurchase friction, and makes the strongest long-term value case."
      },
      {
        title: "Built for ongoing reflection",
        description:
          "Future subscriber-only layers can add follow-up prompts, comparison narratives, and connected-pattern summaries without changing the core scoring foundation."
      }
    ],
    membershipDashboardPillars: [
      {
        title: "Private library continuity",
        description:
          "Membership keeps owned reports, connected topics, and future unlocks in one account surface so insight accumulates instead of fragmenting."
      },
      {
        title: "Connected pattern visibility",
        description:
          "Subscribers can move from one active topic into adjacent patterns more easily when self-pressure, attachment, boundaries, recovery, or identity themes overlap."
      },
      {
        title: "Future follow-up layers",
        description:
          "The architecture is already prepared for follow-up reflection prompts, comparison narratives, and broader pattern summaries that make later membership use more valuable."
      },
      {
        title: "Calm ownership experience",
        description:
          "Membership is positioned as a quiet continuity layer around reports, not a loud billing upsell or a replacement for the one-time purchase path."
      }
    ],
    membershipFutureLayers: [
      {
        title: "Follow-up reflection prompts",
        description:
          "Short prompts tied to the specific pattern you already explored, designed to help you notice whether the same loop is softening, shifting, or repeating."
      },
      {
        title: "Connected pattern summaries",
        description:
          "A later subscriber layer can compare adjacent reports and show where attachment, stress, identity, or self-evaluation patterns appear to overlap."
      },
      {
        title: "What changed since your last report",
        description:
          "Future comparison narratives can highlight whether the strongest tension moved, softened, or became more context-specific over time."
      },
      {
        title: "Ongoing monthly reflection digests",
        description:
          "A future monthly summary can organize recent reports, prompts, and repeated triggers into one calm review rather than isolated snapshots."
      }
    ],
    membershipPlanCards: [
        {
          id: "single-report",
          name: singleReport?.title ?? "Single Insight Report",
          price: pricingLabels.singleInsightReport,
          cadence: "one-time",
          badge: "Focused",
          description:
          "One full report for one pattern that already feels active.",
          features: [
            "One full insight report",
            "Saved in your dashboard after purchase",
            "Download and email delivery paths",
            "Best for one clearly defined question"
          ],
        cta: "Buy Insight Report",
        href: "/assessments",
        comparisonLabel: "A good first step"
      },
      {
        id: "premium-report",
        name: premiumReport?.title ?? "Premium Deep Insight Report",
        price: pricingLabels.premiumDeepInsightReport,
        cadence: "one-time",
        badge: "Expanded",
        description:
          "A deeper report with broader interpretation on the same topic.",
        features: [
          "Expanded interpretation and deeper contextual insight",
          "Broader report depth across the same topic",
          "Saved in the same private dashboard library",
          "Best when one question clearly matters and you want more than the core report"
        ],
        cta: "Buy Premium Report",
        href: "/assessments",
        comparisonLabel: "Deeper one-time access"
      },
      {
        id: "annual-membership",
        name: annualMembership?.title ?? "Membership",
        price: pricingLabels.membershipAnnualPlain ?? "",
        cadence: annualMembership?.cadenceLabel ?? "per year",
        secondaryPrice: pricingLabels.membershipMonthlyPlain ?? undefined,
        secondaryCadence: monthlyMembership?.cadenceLabel ?? "per month",
        badge: "Recommended",
        featured: true,
        description:
          "The strongest option for people who want more than one report, want their insight history in one place, and expect future assessments to matter to them.",
        features: [
          "Access to all 10 core assessments",
          "Full report library and dashboard history",
          "Future assessments included while membership is active",
          "Connected-pattern recommendations across reports",
          "Prepared for future subscriber follow-up tools"
        ],
        cta: "Start Membership",
        href: "/assessments",
        supportingNote:
          "Annual is the strongest value for ongoing insight access and the clearest alternative to repeated one-off report purchases.",
        comparisonLabel: "Best for ongoing insight"
      },
      {
        id: "monthly-membership",
        name: monthlyMembership?.title ?? "Monthly Membership",
        price: pricingLabels.membershipMonthlyPlain ?? "",
        cadence: monthlyMembership?.cadenceLabel ?? "per month",
        badge: "Flexible",
        description:
          "A lighter commitment for users who want recurring access now, but still expect more than a single report or isolated purchase path.",
        features: [
          "Full library access while active",
          "Saved report history stays organized",
          "Useful before committing to annual membership",
          "Secondary option beside the annual plan"
        ],
        cta: "See Membership Topics",
        href: "/assessments",
        supportingNote: "Designed as a flexible option, not the primary recommendation.",
        comparisonLabel: "Flexible recurring access"
      }
    ],
    membershipNarrative: {
      homepageTitle:
        "Membership turns separate reports into one private insight system.",
      homepageDescription:
        `It is meant for people who want broader pattern visibility over time: saved reports, future assessments, connected-pattern suggestions, and later follow-up reflection layers. Annual membership is ${pricingLabels.membershipAnnual}; monthly stays available at ${pricingLabels.membershipMonthly}.`,
      pricingTitle:
        "Choose between one report, a deeper premium report, and a longer-term insight system.",
      pricingDescription:
        `One-time purchases stay useful. Membership becomes the stronger option when multiple topics are active, connected, or likely to matter again later. Current public pricing is ${pricingLabels.singleInsightReport} for a single report, ${pricingLabels.premiumDeepInsightReport} for a premium deep report, and ${pricingLabels.membershipAnnual} or ${pricingLabels.membershipMonthly} for membership.`,
      annualRecommendation:
        `Annual membership at ${pricingLabels.membershipAnnual} is the clearest fit when you expect more than one report or want your full insight history to stay in one place.`,
      dashboardActiveDescription:
        "Membership is most useful when the account becomes a living library instead of a pile of isolated purchases. It keeps current access visible while leaving room for future comparison and follow-up layers.",
      dashboardInactiveDescription:
        `Membership becomes worth considering once you want more than a single report. Its value comes from continuity, broader access, and later pattern comparison rather than urgency. Annual membership is ${pricingLabels.membershipAnnual}; monthly stays available at ${pricingLabels.membershipMonthly}.`,
      postPurchaseTitle:
        "You've unlocked one insight. Explore the full insight library if the pattern does not stop here.",
      postPurchaseDescription:
        `If you expect adjacent topics, repeated dynamics, or future assessments to matter, membership keeps everything in one private library and makes follow-up insight more coherent later. Choose ${pricingLabels.membershipAnnual} for the strongest value or ${pricingLabels.membershipMonthly} for flexible access.`,
      libraryBadge: "Member library",
      annualBadge: "Annual recommended"
    }
  };
}

const defaultMembershipContent = getMembershipContent("international");

export const membershipHomepageBenefits =
  defaultMembershipContent.membershipHomepageBenefits;
export const membershipValuePillars = defaultMembershipContent.membershipValuePillars;
export const membershipDashboardPillars =
  defaultMembershipContent.membershipDashboardPillars;
export const membershipFutureLayers = defaultMembershipContent.membershipFutureLayers;
export const membershipPlanCards = defaultMembershipContent.membershipPlanCards;
export const membershipNarrative = defaultMembershipContent.membershipNarrative;
