import type {
  AssessmentDefinition,
  AssessmentResultProfile
} from "@/lib/types/assessment-domain";

export type AssessmentFlowStage =
  | "intro"
  | "questions"
  | "transition"
  | "preview";

export type AssessmentTransitionStep = {
  id: string;
  label: string;
  detail: string;
};

export function getAssessmentProgressMessage(
  answeredCount: number,
  totalQuestions: number
) {
  const ratio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;

  if (ratio === 0) {
    return "You are just getting oriented.";
  }

  if (ratio < 0.3) {
    return "You are easing into the pattern.";
  }

  if (ratio < 0.55) {
    return "You are about halfway through.";
  }

  if (ratio < 0.85) {
    return "You are in the back half now.";
  }

  return "Just a few more reflections.";
}

export function getTransitionSummary(assessment: AssessmentDefinition) {
  return {
    title: "Analyzing your response patterns",
    description:
      "We are reviewing the strongest response patterns, shaping the clearest opening read, and preparing a more thoughtful preview before the deeper report opens.",
    note: `Your preview will show the clearest pattern signals first. The fuller ${assessment.reportLabel.toLowerCase()} remains separate so the deeper interpretation still feels substantial.`,
    durationMs: 12400,
    steps: [
      {
        id: "response-patterns",
        label: "Reading the response pattern",
        detail:
          "Looking for the strongest repeated signals across your answers."
      },
      {
        id: "pressure-points",
        label: "Finding the main pressure points",
        detail:
          "Comparing where tension, intensity, and steadier signals seem to gather."
      },
      {
        id: "preview-preparation",
        label: "Preparing your insight preview",
        detail:
          "Shaping the opening summary, strongest signals, and the fuller report path."
      }
    ] satisfies AssessmentTransitionStep[]
  };
}

export function getPreviewHeadline(resultProfile: AssessmentResultProfile) {
  return resultProfile.summaryTitle;
}

export function getResultPreviewInsights(resultProfile: AssessmentResultProfile) {
  return resultProfile.previewInsights.map((insight) => ({
    id: insight.id,
    title: insight.title,
    description: insight.body,
    band:
      resultProfile.dimensionScores.find((dimension) =>
        insight.sourceDimensionKeys.includes(dimension.key)
      )?.band ?? "moderate",
    score:
      resultProfile.dimensionScores.find((dimension) =>
        insight.sourceDimensionKeys.includes(dimension.key)
      )?.normalizedScore ?? 50
  }));
}
