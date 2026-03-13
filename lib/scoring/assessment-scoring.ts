import { buildAIInsightPayload } from "@/lib/ai/payloads/build-ai-insight-payload";
import { buildAssessmentResultContent } from "@/lib/results/assessment-result-logic";
import type {
  AssessmentDefinition,
  AssessmentQuestion,
  AssessmentResultProfile,
  DimensionScore,
  ScoreBand
} from "@/lib/types/assessment-domain";

export type AssessmentResponseMap = Record<string, string>;

function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

function getAnswerWeight(
  question: AssessmentQuestion,
  optionId: string | undefined,
  dimensionKey: string
) {
  const selectedOption = question.options.find((option) => option.id === optionId);
  return selectedOption?.dimensionWeights[dimensionKey] ?? 0;
}

function getDimensionRange(question: AssessmentQuestion, dimensionKey: string) {
  const weights = question.options.map(
    (option) => option.dimensionWeights[dimensionKey] ?? 0
  );

  return {
    min: Math.min(...weights),
    max: Math.max(...weights)
  };
}

export function getScoreBand(normalizedScore: number): ScoreBand {
  if (normalizedScore < 30) {
    return "low";
  }

  if (normalizedScore < 55) {
    return "moderate";
  }

  if (normalizedScore < 75) {
    return "elevated";
  }

  return "high";
}

function buildDimensionScore(
  assessment: AssessmentDefinition,
  responses: AssessmentResponseMap,
  dimensionKey: string
): DimensionScore {
  const dimension = assessment.dimensions.find((item) => item.key === dimensionKey);

  if (!dimension) {
    throw new Error(`Unknown dimension: ${dimensionKey}`);
  }

  let rawScore = 0;
  let minScore = 0;
  let maxScore = 0;

  assessment.questions.forEach((question) => {
    const range = getDimensionRange(question, dimensionKey);
    const responseId = responses[question.id];

    rawScore += getAnswerWeight(question, responseId, dimensionKey);
    minScore += range.min;
    maxScore += range.max;
  });

  const normalizedScore =
    maxScore === minScore
      ? 0
      : Math.round(((rawScore - minScore) / (maxScore - minScore)) * 100);
  const band = getScoreBand(normalizedScore);

  return {
    key: dimension.key,
    label: dimension.label,
    shortLabel: dimension.shortLabel,
    rawScore: roundScore(rawScore),
    minScore: roundScore(minScore),
    maxScore: roundScore(maxScore),
    normalizedScore,
    band,
    interpretation: dimension.bandDescriptions[band]
  };
}

export function collectContextMarkers(
  assessment: AssessmentDefinition,
  responses: AssessmentResponseMap
) {
  const counts = new Map<string, number>();

  assessment.questions.forEach((question) => {
    const selectedOption = question.options.find(
      (option) => option.id === responses[question.id]
    );

    selectedOption?.contextMarkers?.forEach((marker) => {
      counts.set(marker, (counts.get(marker) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([marker]) => marker)
    .slice(0, 6);
}

export function buildDimensionScores(
  assessment: AssessmentDefinition,
  responses: AssessmentResponseMap
) {
  return assessment.dimensions
    .map((dimension) => buildDimensionScore(assessment, responses, dimension.key))
    .sort((left, right) => right.normalizedScore - left.normalizedScore);
}

export function scoreAssessment(
  assessment: AssessmentDefinition,
  responses: AssessmentResponseMap
): AssessmentResultProfile {
  const dimensionScores = buildDimensionScores(assessment, responses);
  const answeredCount = Object.keys(responses).length;
  const completionPercent = Math.round(
    (answeredCount / Math.max(assessment.questions.length, 1)) * 100
  );
  const dominantDimensionKeys = dimensionScores
    .filter((dimension) => dimension.normalizedScore >= 55)
    .slice(0, 2)
    .map((dimension) => dimension.key);
  const supportingDimensionKeys = dimensionScores
    .filter((dimension) => !dominantDimensionKeys.includes(dimension.key))
    .slice(0, 2)
    .map((dimension) => dimension.key);
  const contextMarkers = collectContextMarkers(assessment, responses);
  const resultContent = buildAssessmentResultContent(
    assessment,
    dimensionScores,
    contextMarkers
  );

  const resultProfile: AssessmentResultProfile = {
    assessmentId: assessment.id,
    assessmentSlug: assessment.slug,
    topicKey: assessment.topicKey,
    answeredCount,
    totalQuestions: assessment.questions.length,
    completionPercent,
    dimensionScores,
    dominantDimensionKeys,
    supportingDimensionKeys,
    contextMarkers,
    summaryLabel: resultContent.summaryLabel,
    summaryTitle: resultContent.summaryTitle,
    summaryNarrative: resultContent.summaryNarrative,
    summaryDescriptor: resultContent.summaryDescriptor,
    previewHighlights: resultContent.previewHighlights,
    previewInsights: resultContent.previewInsights,
    dominantTendencies: resultContent.dominantTendencies,
    protectiveTendencies: resultContent.protectiveTendencies,
    frictionAreas: resultContent.frictionAreas,
    patternClusters: resultContent.patternClusters,
    premiumBoundary: resultContent.premiumBoundary,
    visiblePreviewSectionIds: resultContent.premiumBoundary.visibleSectionIds,
    lockedSectionIds: resultContent.premiumBoundary.lockedSectionIds,
    relatedRecommendations: resultContent.relatedRecommendations,
    bundleSuggestion: resultContent.bundleSuggestion,
    membershipUpsell: resultContent.membershipUpsell,
    aiPayload: {} as AssessmentResultProfile["aiPayload"]
  };

  resultProfile.aiPayload = buildAIInsightPayload(assessment, resultProfile);

  return resultProfile;
}
