import type {
  AIRecommendationContext,
  AssessmentDefinition,
  AssessmentResultProfile,
  BundleSuggestion,
  MatchStrength,
  RelatedInsightDecision
} from "@/lib/types/assessment-domain";

import {
  getBundleBlueprintByKey,
  getCrossAssessmentMapEntry,
  insightClusterLabels,
  type InsightClusterKey
} from "./cross-assessment-map";

type RecommendationEngineInput = {
  assessment: AssessmentDefinition;
  dominantDimensionKeys: string[];
  previousReportSlugs: string[];
  existingRecommendations?: RelatedInsightDecision[];
  maxResults?: number;
};

type RecommendationCandidate = {
  slug: string;
  recommendationType: RelatedInsightDecision["recommendationType"];
  score: number;
  baseReason: string;
  whyNow?: string;
  clusterKey: InsightClusterKey;
  bundleKey?: string;
  sourceDimensionKeys: string[];
  historyNote?: string;
};

export type RecommendationEngineResult = {
  recommendations: RelatedInsightDecision[];
  bundleSuggestion: BundleSuggestion | null;
  aiContext: AIRecommendationContext;
};

function matchStrengthForScore(score: number): MatchStrength {
  if (score >= 12) {
    return "strong";
  }

  if (score >= 8) {
    return "supporting";
  }

  return "adjacent";
}

function mergeRecommendationReasons(
  base: RelatedInsightDecision | undefined,
  candidate: RecommendationCandidate
) {
  if (!base) {
    return candidate.baseReason;
  }

  if (base.reason.includes(candidate.baseReason)) {
    return base.reason;
  }

  return base.reason;
}

function buildHistoryNote(currentAssessmentSlug: string, previousReportSlugs: string[]) {
  if (!previousReportSlugs.length) {
    return undefined;
  }

  if (previousReportSlugs.includes(currentAssessmentSlug)) {
    return "The user has already returned to this topic, which increases the value of a connected next insight.";
  }

  return "A prior report already exists in the account library, so the next recommendation should add context instead of duplicating what the user already owns.";
}

function buildCandidates(input: RecommendationEngineInput) {
  const entry = getCrossAssessmentMapEntry(input.assessment.slug);

  if (!entry) {
    return [];
  }

  const previousReportSet = new Set(input.previousReportSlugs);

  return entry.links
    .filter((link) => link.slug !== input.assessment.slug && !previousReportSet.has(link.slug))
    .map<RecommendationCandidate>((link) => {
      let score = link.baseScore;
      const sourceDimensionKeys: string[] = [];
      let whyNow = "";

      link.dimensionTriggers?.forEach((trigger) => {
        if (input.dominantDimensionKeys.includes(trigger.dimensionKey)) {
          score += trigger.boost;
          sourceDimensionKeys.push(trigger.dimensionKey);
          if (!whyNow) {
            whyNow = trigger.reason;
          }
        }
      });

      const historyNote = buildHistoryNote(input.assessment.slug, input.previousReportSlugs);

      if (input.previousReportSlugs.length > 0) {
        score += 1;
      }

      return {
        slug: link.slug,
        recommendationType: link.recommendationType,
        score,
        baseReason: link.rationale,
        whyNow: whyNow || undefined,
        clusterKey: link.clusterKey,
        bundleKey: link.bundleKey,
        sourceDimensionKeys,
        historyNote
      };
    })
    .sort((left, right) => right.score - left.score);
}

function mergeWithExistingRecommendations(
  candidates: RecommendationCandidate[],
  existingRecommendations: RelatedInsightDecision[] = [],
  maxResults: number
) {
  const existingBySlug = new Map(
    existingRecommendations.map((recommendation) => [recommendation.slug, recommendation])
  );
  const merged = candidates.map<RelatedInsightDecision>((candidate) => {
    const existing = existingBySlug.get(candidate.slug);
    const matchStrength =
      existing && existing.matchStrength === "strong"
        ? "strong"
        : matchStrengthForScore(candidate.score);

    return {
      slug: candidate.slug,
      recommendationType:
        existing?.recommendationType ?? candidate.recommendationType,
      reason: mergeRecommendationReasons(existing, candidate),
      matchStrength,
      clusterKey: candidate.clusterKey,
      clusterLabel: insightClusterLabels[candidate.clusterKey],
      sourceDimensionKeys: candidate.sourceDimensionKeys,
      whyNow: candidate.whyNow,
      bundleKey: candidate.bundleKey,
      historyNote: existing?.historyNote ?? candidate.historyNote
    };
  });

  const remainingExisting = existingRecommendations.filter(
    (recommendation) =>
      recommendation.slug !== "membership" &&
      !merged.some((item) => item.slug === recommendation.slug)
  );

  return [...merged, ...remainingExisting].slice(0, maxResults);
}

function buildBundleSuggestion(
  assessment: AssessmentDefinition,
  recommendations: RelatedInsightDecision[]
) {
  const bundleKeys = recommendations
    .map((item) => item.bundleKey)
    .filter((key): key is string => Boolean(key));
  const uniqueBundleKeys = [...new Set(bundleKeys)];

  for (const bundleKey of uniqueBundleKeys) {
    const blueprint = getBundleBlueprintByKey(bundleKey);

    if (!blueprint || !blueprint.assessmentSlugs.includes(assessment.slug)) {
      continue;
    }

    const recommendedSlugs = recommendations.map((item) => item.slug);
    const overlap = blueprint.assessmentSlugs.filter(
      (slug) => slug === assessment.slug || recommendedSlugs.includes(slug)
    );

    if (overlap.length < 2) {
      continue;
    }

    return {
      id: bundleKey,
      title: blueprint.title,
      description: blueprint.description,
      assessmentSlugs: blueprint.assessmentSlugs,
      rationale: blueprint.positioning
    };
  }

  return null;
}

function buildAIContext(
  assessment: AssessmentDefinition,
  input: RecommendationEngineInput,
  recommendations: RelatedInsightDecision[],
  bundleSuggestion: BundleSuggestion | null
): AIRecommendationContext {
  const entry = getCrossAssessmentMapEntry(assessment.slug);

  return {
    currentAssessmentSlug: assessment.slug,
    previousReportSlugs: input.previousReportSlugs,
    dominantDimensionKeys: input.dominantDimensionKeys,
    relatedInsightClusters:
      entry?.clusters.map((clusterKey) => ({
        key: clusterKey,
        label: insightClusterLabels[clusterKey]
      })) ?? [],
    recommendedInsights: recommendations.map((item) => ({
      slug: item.slug,
      matchStrength: item.matchStrength,
      clusterKey: item.clusterKey,
      clusterLabel: item.clusterLabel,
      reason: item.reason,
      whyNow: item.whyNow
    })),
    preparedBundleKeys: bundleSuggestion ? [bundleSuggestion.id] : []
  };
}

export function buildCrossAssessmentRecommendations(
  input: RecommendationEngineInput
): RecommendationEngineResult {
  const maxResults = input.maxResults ?? 3;
  const candidates = buildCandidates(input);
  const recommendations = mergeWithExistingRecommendations(
    candidates,
    input.existingRecommendations,
    maxResults
  );
  const bundleSuggestion = buildBundleSuggestion(input.assessment, recommendations);

  return {
    recommendations,
    bundleSuggestion,
    aiContext: buildAIContext(
      input.assessment,
      input,
      recommendations,
      bundleSuggestion
    )
  };
}

export function buildResultProfileRecommendationResult(
  assessment: AssessmentDefinition,
  resultProfile: Pick<
    AssessmentResultProfile,
    "dominantDimensionKeys" | "relatedRecommendations"
  >,
  previousReportSlugs: string[] = []
) {
  return buildCrossAssessmentRecommendations({
    assessment,
    dominantDimensionKeys: resultProfile.dominantDimensionKeys,
    previousReportSlugs,
    existingRecommendations: resultProfile.relatedRecommendations
  });
}

export function buildLibraryRecommendationSet(
  ownedAssessmentSlugs: string[],
  maxResults = 3
) {
  const ownedSet = new Set(ownedAssessmentSlugs);
  const candidateScores = new Map<
    string,
    {
      score: number;
      reasons: string[];
      clusterKey?: InsightClusterKey;
    }
  >();

  ownedAssessmentSlugs.forEach((ownedSlug) => {
    const entry = getCrossAssessmentMapEntry(ownedSlug);

    if (!entry) {
      return;
    }

    entry.links.forEach((link, index) => {
      if (ownedSet.has(link.slug)) {
        return;
      }

      const current = candidateScores.get(link.slug);
      const nextScore = (current?.score ?? 0) + Math.max(1, 4 - index);
      candidateScores.set(link.slug, {
        score: nextScore,
        reasons: [...(current?.reasons ?? []), link.rationale],
        clusterKey: link.clusterKey
      });
    });
  });

  return [...candidateScores.entries()]
    .sort((left, right) => right[1].score - left[1].score)
    .slice(0, maxResults)
    .map(([slug, value]) => ({
      slug,
      recommendationType: "adjacent" as const,
      reason: value.reasons[0],
      matchStrength: value.score >= 5 ? ("strong" as const) : ("supporting" as const),
      clusterKey: value.clusterKey,
      clusterLabel: value.clusterKey ? insightClusterLabels[value.clusterKey] : undefined,
      historyNote:
        "Suggested from the patterns already present in the user's report library rather than from a single isolated result."
    }));
}
