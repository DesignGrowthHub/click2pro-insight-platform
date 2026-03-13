import type { Assessment } from "@/lib/assessments";
import { getAssessmentsBySlugs } from "@/lib/assessments";
import type { CommerceState } from "@/lib/commerce/types";
import { buildLibraryRecommendationSet } from "@/lib/recommendations/engine";
import type { RelatedInsightDecision } from "@/lib/types/assessment-domain";

export type MembershipOpportunity = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type MembershipRecommendationSet = {
  nextInsights: Assessment[];
  insightDecisions: RelatedInsightDecision[];
  opportunities: MembershipOpportunity[];
};

function fallbackMembershipInsights() {
  return getAssessmentsBySlugs([
    "attachment-and-relationship-style-report",
    "personality-burnout-and-stress-report",
    "identity-and-inner-conflict-profile"
  ]);
}

export function buildMembershipRecommendations(
  state: CommerceState
): MembershipRecommendationSet {
  const ownedSlugs = new Set<string>();

  state.ownedReports.forEach((report) => ownedSlugs.add(report.assessmentSlug));
  state.ownedBundles.forEach((bundle) => {
    bundle.includedAssessmentSlugs.forEach((slug) => ownedSlugs.add(slug));
  });
  state.subscriptions.forEach((subscription) => {
    if (subscription.status === "active" || subscription.status === "trialing") {
      subscription.unlockedAssessmentSlugs.forEach((slug) => ownedSlugs.add(slug));
    }
  });

  const insightDecisions = buildLibraryRecommendationSet([...ownedSlugs]);
  const weightedInsights = getAssessmentsBySlugs(
    insightDecisions.map((decision) => decision.slug)
  );

  const nextInsights =
    weightedInsights.length > 0 ? weightedInsights : fallbackMembershipInsights();
  const topicLabels = [...new Set(state.ownedReports.map((report) => report.topic))].slice(
    0,
    3
  );
  const topicSummary =
    topicLabels.length > 1
      ? topicLabels.join(", ").replace(/, ([^,]+)$/, ", and $1")
      : topicLabels[0] ?? "multiple adjacent topics";

  return {
    nextInsights,
    insightDecisions,
    opportunities: [
      {
        id: "connected-patterns",
        label: "Connected view",
        title: "Bring related reports into one clearer pattern picture.",
        description:
          `Membership is prepared to compare signals across ${topicSummary} so one result does not have to stand alone when the same tension appears from more than one angle.`
      },
      {
        id: "follow-up-prompts",
        label: "Follow-up layer",
        title: "Future reflection prompts can stay connected to the reports you already own.",
        description:
          "Subscriber-only follow-up prompts can later be tied to your existing report history, making reflection feel cumulative rather than restarted from zero."
      },
      {
        id: "comparison-narratives",
        label: "Comparison later",
        title: "A later membership layer can show what actually changed across time.",
        description:
          "The architecture is already prepared for comparison narratives that explain whether the pressure, attachment, or recovery pattern softened, shifted, or simply became easier to name."
      }
    ]
  };
}
