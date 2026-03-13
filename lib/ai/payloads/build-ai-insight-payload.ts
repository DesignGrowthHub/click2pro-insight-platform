import { buildSubscriptionFollowUpBlueprint } from "@/lib/ai/followups/subscriber-followups";
import { buildAIInsightSafetyGuardrails } from "@/lib/ai/prompts/report-section-prompts";
import type {
  AIInsightSectionPlan,
  AIReportInputPayload,
  AssessmentDefinition,
  AssessmentResultProfile,
  ComposedReportSection,
  ReportSectionDefinition
} from "@/lib/types/assessment-domain";

function buildSectionAnchorSummary(
  section: ReportSectionDefinition,
  resultProfile: AssessmentResultProfile | null | undefined
) {
  const dimensionScores = resultProfile?.dimensionScores ?? [];

  const matchingDimensions =
    section.requiredDimensionKeys.length > 0
      ? dimensionScores.filter((dimension) =>
          section.requiredDimensionKeys.includes(dimension.key)
        )
      : dimensionScores.slice(0, 2);

  if (matchingDimensions.length === 0) {
    return (
      resultProfile?.summaryNarrative ??
      "Use the strongest available deterministic summary instead of inventing extra certainty."
    );
  }

  return matchingDimensions
    .map((dimension) => `${dimension.label}: ${dimension.interpretation}`)
    .join(" ");
}

function requestedWordRange(sectionId: string) {
  switch (sectionId) {
    case "pattern-summary":
      return {
        min: 120,
        max: 170
      };
    case "what-responses-suggest":
      return {
        min: 140,
        max: 210
      };
    case "related-next-insights":
      return {
        min: 90,
        max: 150
      };
    default:
      return {
        min: 150,
        max: 220
      };
  }
}

function buildIntensitySignal(resultProfile: AssessmentResultProfile | null | undefined) {
  const dimensionScores = resultProfile?.dimensionScores ?? [];
  const dominant = dimensionScores[0];
  const secondary = dimensionScores[1];

  if (!dominant) {
    return "No dominant intensity signal was available.";
  }

  if (!secondary) {
    return `${dominant.label} is the clearest active pattern at a ${dominant.band} level.`;
  }

  return `${dominant.label} is the clearest active pattern at a ${dominant.band} level, with ${secondary.label.toLowerCase()} operating as a secondary layer at a ${secondary.band} level.`;
}

function buildPromptFocus(
  section: ReportSectionDefinition,
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile | null | undefined
) {
  return [
    ...section.placeholderFocus,
    ...(resultProfile?.previewInsights ?? []).slice(0, 2).map((insight) => insight.title),
    ...assessment.focusAreas.slice(0, 2)
  ].slice(0, 6);
}

function getSectionTemplate(sectionId: string): AIInsightSectionPlan["template"] {
  switch (sectionId) {
    case "pattern-summary":
      return "pattern_summary";
    case "what-responses-suggest":
      return "pattern_interpretation";
    case "emotional-drivers":
      return "emotional_pressure_points";
    case "daily-life-impact":
      return "real_life_expression";
    case "blind-spots-or-tension-areas":
      return "hidden_friction_areas";
    case "stability-suggestions":
      return "stability_and_clarity";
    case "related-next-insights":
      return "related_insight_recommendations";
    default:
      return "pattern_interpretation";
  }
}

function getValidationFocus(sectionId: string) {
  switch (sectionId) {
    case "pattern-summary":
      return [
        "Keep the summary tied to scored themes rather than generic encouragement.",
        "Name the primary pattern mechanism instead of describing the profile in broad motivational language.",
        "Avoid diagnosis or exaggerated certainty."
      ];
    case "what-responses-suggest":
      return [
        "Explain the central mechanism behind the scored pattern.",
        "Avoid drifting into emotional-driver or stabilizing-advice language too early."
      ];
    case "emotional-drivers":
      return [
        "Explain intensifiers without sounding clinical.",
        "Tie the pressure points back to the strongest scored dimensions or tension areas.",
        "Keep the section respectful and bounded to the profile."
      ];
    case "daily-life-impact":
      return [
        "Translate the pattern into recognizable behavior and outward expression.",
        "Avoid repeating the deeper emotional-driver explanation."
      ];
    case "blind-spots-or-tension-areas":
      return [
        "Surface hidden contradictions, blind spots, or tension loops instead of restating the core pattern.",
        "Keep the section specific to friction already visible in the scored profile."
      ];
    case "stability-suggestions":
      return [
        "Offer reflective guidance rather than treatment language.",
        "Tie any stabilizing direction to the scored pressure pattern instead of broad self-help advice.",
        "Avoid prescriptive, motivational, or therapist-like tone."
      ];
    case "related-next-insights":
      return [
        "Recommendations must feel logically connected to the current result.",
        "Avoid random cross-sell language."
      ];
    default:
      return [
        "Keep the section specific to the scored pattern.",
        "Use calm, non-clinical phrasing."
      ];
  }
}

function getOutputContract(sectionId: string): AIInsightSectionPlan["outputContract"] {
  switch (sectionId) {
    case "related-next-insights":
      return {
        synopsisRequired: true,
        paragraphRange: {
          min: 1,
          max: 2
        },
        bulletRange: {
          min: 2,
          max: 3
        },
        calloutOptional: false,
        requiredFields: [
          "synopsis",
          "main_mechanism",
          "real_world_expression",
          "interpretation",
          "watch_for",
          "action_focus"
        ]
      };
    case "pattern-summary":
      return {
        synopsisRequired: true,
        paragraphRange: {
          min: 2,
          max: 2
        },
        bulletRange: {
          min: 2,
          max: 3
        },
        calloutOptional: true,
        requiredFields: [
          "synopsis",
          "main_mechanism",
          "real_world_expression",
          "interpretation",
          "watch_for",
          "action_focus"
        ]
      };
    default:
      return {
        synopsisRequired: true,
        paragraphRange: {
          min: 2,
          max: 3
        },
        bulletRange: {
          min: 2,
          max: 4
        },
        calloutOptional: true,
        requiredFields: [
          "synopsis",
          "main_mechanism",
          "real_world_expression",
          "interpretation",
          "watch_for",
          "action_focus"
        ]
      };
  }
}

function buildSectionGenerationPlan(
  assessment: AssessmentDefinition
): AIInsightSectionPlan[] {
  return assessment.reportBlueprint.sections
    .filter((section) => section.generationMode !== "deterministic")
    .map((section) => ({
      sectionId: section.id,
      title: section.title,
      template: getSectionTemplate(section.id),
      retryable: true,
      validationFocus: getValidationFocus(section.id),
      outputContract: getOutputContract(section.id)
    }));
}

export function buildAIInsightPayload(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile | null | undefined
): AIReportInputPayload {
  const dimensionScores = resultProfile?.dimensionScores ?? [];
  const previewInsights = resultProfile?.previewInsights ?? [];
  const dominantTendencies = resultProfile?.dominantTendencies ?? [];
  const protectiveTendencies = resultProfile?.protectiveTendencies ?? [];
  const frictionAreas = resultProfile?.frictionAreas ?? [];
  const contextMarkers = resultProfile?.contextMarkers ?? [];
  const previewHighlights = resultProfile?.previewHighlights ?? [];
  const patternClusters = resultProfile?.patternClusters ?? [];
  const relatedRecommendations = resultProfile?.relatedRecommendations ?? [];
  const dominantDimensionKeys = resultProfile?.dominantDimensionKeys ?? [];
  const bundleSuggestion = resultProfile?.bundleSuggestion ?? null;
  const membershipUpsell = resultProfile?.membershipUpsell ?? {
    title: "Membership keeps related reports and future insights in one place.",
    description:
      "If you later want broader visibility across connected patterns, membership keeps that access inside the same private library.",
    benefits: [
      "Saved report history",
      "Future assessments while active",
      "Connected pattern visibility over time"
    ]
  };

  const followUpBlueprint = buildSubscriptionFollowUpBlueprint(
    assessment,
    resultProfile
  );
  const safetyGuardrails = buildAIInsightSafetyGuardrails();
  const sectionGenerationPlan = buildSectionGenerationPlan(assessment);

  return {
    assessmentId: assessment.id,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    assessmentSubtitle: assessment.subtitle,
    topicKey: assessment.topicKey,
    sourceOfTruth: "deterministic_scoring",
    aiRole: "narrative_interpretation",
    reportBlueprintId: assessment.reportBlueprint.id,
    reportTitle: assessment.reportBlueprint.title,
    reportSubtitle: assessment.reportBlueprint.subtitle,
    targetPainPoint: assessment.targetPainPoint,
    resultSummary: {
      label: resultProfile?.summaryLabel ?? assessment.title,
      title: resultProfile?.summaryTitle ?? `${assessment.title} summary`,
      narrative:
        resultProfile?.summaryNarrative ??
        "A saved deterministic result profile was not fully available, so this payload falls back to the assessment topic and available scored context.",
      descriptor:
        resultProfile?.summaryDescriptor ??
        "The narrative layer should stay grounded in the available scored signals and avoid overclaiming beyond them."
    },
    previewInsightSummary: previewInsights
      .map((insight) => insight.body)
      .join(" "),
    dominantDimensions: dimensionScores.slice(0, 2).map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      shortLabel: dimension.shortLabel,
      normalizedScore: dimension.normalizedScore,
      band: dimension.band,
      interpretation: dimension.interpretation
    })),
    secondaryDimensions: dimensionScores.slice(2, 4).map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      shortLabel: dimension.shortLabel,
      normalizedScore: dimension.normalizedScore,
      band: dimension.band,
      interpretation: dimension.interpretation
    })),
    dominantTendencies: dominantTendencies.map((tendency) => ({
      label: tendency.label,
      description: tendency.description,
      intensityBand: tendency.intensityBand
    })),
    stabilizingTendencies: protectiveTendencies.map((tendency) => ({
      label: tendency.label,
      description: tendency.description,
      intensityBand: tendency.intensityBand
    })),
    protectiveTendencies: protectiveTendencies.map((tendency) => ({
      label: tendency.label,
      description: tendency.description,
      intensityBand: tendency.intensityBand
    })),
    tensionAreas: frictionAreas.map((area) => ({
      label: area.label,
      description: area.description,
      intensityBand: area.intensityBand
    })),
    contextMarkers,
    previewHighlights,
    previewInsights: previewInsights.map((insight) => ({
      title: insight.title,
      body: insight.body,
      tone: insight.tone
    })),
    patternClusters: patternClusters.map((cluster) => ({
      label: cluster.label,
      description: cluster.description,
      intensityBand: cluster.intensityBand
    })),
    dimensionSnapshot: dimensionScores.map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      shortLabel: dimension.shortLabel,
      normalizedScore: dimension.normalizedScore,
      band: dimension.band,
      interpretation: dimension.interpretation
    })),
    bundleContext: bundleSuggestion,
    membershipContext: membershipUpsell,
    recommendationContext: {
      currentAssessmentSlug: assessment.slug,
      previousReportSlugs: [],
      dominantDimensionKeys,
      relatedInsightClusters: [
        ...new Map(
          relatedRecommendations
            .filter((item) => item.clusterKey && item.clusterLabel)
            .map((item) => [
              item.clusterKey as string,
              {
                key: item.clusterKey as string,
                label: item.clusterLabel as string
              }
            ])
        ).values()
      ],
      recommendedInsights: relatedRecommendations.map((recommendation) => ({
        slug: recommendation.slug,
        matchStrength: recommendation.matchStrength,
        clusterKey: recommendation.clusterKey,
        clusterLabel: recommendation.clusterLabel,
        reason: recommendation.reason,
        whyNow: recommendation.whyNow
      })),
      preparedBundleKeys: bundleSuggestion ? [bundleSuggestion.id] : []
    },
    followUpBlueprint,
    publishedReportBlueprint: assessment.reportBlueprint.publishedContext ?? null,
    toneRequirements: [
      "Keep the tone calm, premium, and readable.",
      "Make the writing feel psychologically intelligent without becoming clinical.",
      "Sound like a thoughtful human interpretation rather than a chatbot summary."
    ],
    safetyInstructions: [
      "Avoid diagnosis language, treatment framing, or therapist impersonation.",
      "Avoid false scientific or clinical claims.",
      "Avoid manipulative urgency, exaggerated fear, or motivational fluff."
    ],
    safetyGuardrails,
    sectionGenerationPlan,
    narrativeSectionsToGenerate: sectionGenerationPlan.map((plan) => {
      const section = assessment.reportBlueprint.sections.find(
        (item) => item.id === plan.sectionId
      );

      if (!section) {
        throw new Error(`Unknown report section: ${plan.sectionId}`);
      }

      return {
        sectionId: section.id,
        title: section.title,
        intent: section.narrativeIntent,
        requiredDimensionKeys: section.requiredDimensionKeys,
        anchorSummary: buildSectionAnchorSummary(section, resultProfile),
        contextMarkers,
        dominantDimensionKeys,
        dominantDimensionLabels: dimensionScores
          .filter((dimension) => dominantDimensionKeys.includes(dimension.key))
          .map((dimension) => dimension.label),
        intensitySignal: buildIntensitySignal(resultProfile),
        requestedWordRange: requestedWordRange(section.id),
        promptFocus: buildPromptFocus(section, assessment, resultProfile)
      };
    })
  };
}

export function createAiNarrativePlaceholderBlock(
  section: ComposedReportSection,
  resultProfile: AssessmentResultProfile | null | undefined
) {
  const summaryLabel = resultProfile?.summaryLabel || "the dominant report pattern";

  return {
    id: `${section.id}-ai-placeholder`,
    type: "ai_placeholder" as const,
    label: "AI narrative layer",
    visibility: "full_report_only" as const,
    content:
      `This section is ready for AI-personalized interpretation using ${summaryLabel.toLowerCase()}, ` +
      "the dominant scored dimensions, the section plan, and the safety-bounded prompt bundle prepared in the AI Insight Engine."
  };
}
