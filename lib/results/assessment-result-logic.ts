import type {
  AssessmentDefinition,
  BundleSuggestion,
  DimensionScore,
  MembershipUpsellContext,
  PatternCluster,
  PremiumBoundaryState,
  RelatedInsightDecision,
  ResultInsight,
  ResultTendency,
  ScoreBand
} from "@/lib/types/assessment-domain";
import { buildCrossAssessmentRecommendations } from "@/lib/recommendations/engine";

type ResultContext = {
  assessment: AssessmentDefinition;
  dimensionScores: DimensionScore[];
  scoresByKey: Record<string, DimensionScore>;
  dominant: DimensionScore | null;
  secondary: DimensionScore | null;
  contextMarkers: string[];
};

export type AssessmentResultContent = {
  summaryLabel: string;
  summaryTitle: string;
  summaryNarrative: string;
  summaryDescriptor: string;
  previewHighlights: string[];
  previewInsights: ResultInsight[];
  dominantTendencies: ResultTendency[];
  protectiveTendencies: ResultTendency[];
  frictionAreas: ResultTendency[];
  patternClusters: PatternCluster[];
  premiumBoundary: PremiumBoundaryState;
  relatedRecommendations: RelatedInsightDecision[];
  bundleSuggestion: BundleSuggestion | null;
  membershipUpsell: MembershipUpsellContext;
};

function applyCrossAssessmentRecommendationLayer(
  context: ResultContext,
  content: AssessmentResultContent
): AssessmentResultContent {
  const recommendationResult = buildCrossAssessmentRecommendations({
    assessment: context.assessment,
    dominantDimensionKeys: context.dimensionScores.slice(0, 2).map((dimension) => dimension.key),
    previousReportSlugs: [],
    existingRecommendations: content.relatedRecommendations,
    maxResults: 3
  });

  return {
    ...content,
    relatedRecommendations: recommendationResult.recommendations,
    bundleSuggestion: recommendationResult.bundleSuggestion ?? content.bundleSuggestion
  };
}

const bandRank: Record<ScoreBand, number> = {
  low: 0,
  moderate: 1,
  elevated: 2,
  high: 3
};

function createInsight(
  id: string,
  title: string,
  body: string,
  tone: ResultInsight["tone"],
  sourceDimensionKeys: string[]
): ResultInsight {
  return {
    id,
    title,
    body,
    tone,
    sourceDimensionKeys
  };
}

function createTendency(
  id: string,
  label: string,
  description: string,
  intensityBand: ScoreBand,
  sourceDimensionKeys: string[]
): ResultTendency {
  return {
    id,
    label,
    description,
    intensityBand,
    sourceDimensionKeys
  };
}

function createCluster(
  id: string,
  label: string,
  description: string,
  intensityBand: ScoreBand,
  sourceDimensionKeys: string[]
): PatternCluster {
  return {
    id,
    label,
    description,
    intensityBand,
    sourceDimensionKeys
  };
}

function maxBand(...bands: ScoreBand[]): ScoreBand {
  return bands.reduce((current, next) =>
    bandRank[next] > bandRank[current] ? next : current
  );
}

function bandAtLeast(band: ScoreBand, minimum: ScoreBand) {
  return bandRank[band] >= bandRank[minimum];
}

function hasMarker(context: ResultContext, marker: string) {
  return context.contextMarkers.includes(marker);
}

function recommendationStrength(
  recommendationType: RelatedInsightDecision["recommendationType"],
  isStrong = false
): RelatedInsightDecision["matchStrength"] {
  if (isStrong) {
    return "strong";
  }

  if (recommendationType === "deepen") {
    return "supporting";
  }

  return "adjacent";
}

function buildPremiumBoundary(assessment: AssessmentDefinition): PremiumBoundaryState {
  const lockedSections = assessment.reportBlueprint.sections.filter(
    (section) => section.access === "premium"
  );

  return {
    previewNarrative:
      "The preview is intentionally generous enough to feel grounded, but it stops before the deeper interpretation, blind-spot framing, and stabilizing guidance.",
    lockedNarrative:
      "The premium report expands the pattern into emotional drivers, lived impact, tension areas, and calmer next-step structure.",
    visibleSectionIds: assessment.reportBlueprint.previewSections.map(
      (section) => section.sectionId
    ),
    lockedSectionIds: lockedSections.map((section) => section.id),
    lockedSectionTitles: lockedSections.map((section) => section.title)
  };
}

function buildGenericRelatedRecommendations(
  context: ResultContext
): RelatedInsightDecision[] {
  const strongPattern = bandAtLeast(context.dominant?.band ?? "low", "elevated");

  return context.assessment.relatedAssessments.map((recommendation) => ({
    ...recommendation,
    matchStrength: recommendationStrength(
      recommendation.recommendationType,
      strongPattern && recommendation.recommendationType === "deepen"
    )
  }));
}

function buildGenericBundleSuggestion(
  context: ResultContext
): BundleSuggestion | null {
  const suggestedSlugs = context.assessment.relatedAssessments
    .filter((item) => item.slug !== "membership")
    .slice(0, 2)
    .map((item) => item.slug);

  if (suggestedSlugs.length < 2) {
    return null;
  }

  return {
    id: `${context.assessment.slug}-bundle`,
    title: `${context.assessment.category} insight bundle`,
    description:
      "A cross-report path that keeps the current pattern in context instead of treating it like a one-off result.",
    assessmentSlugs: [context.assessment.slug, ...suggestedSlugs],
    rationale:
      "Best used when the user is likely to compare adjacent patterns before deciding what is primary."
  };
}

function buildGenericMembershipUpsell(
  context: ResultContext
): MembershipUpsellContext {
  return {
    title: "Membership is designed for continuity, not one isolated result.",
    description: context.assessment.subscriptionUpsellNote,
    benefits: [
      "Save this report and compare it against later results",
      "Unlock adjacent insight paths without restarting from zero",
      "Keep future AI-personalized narrative sections in one report library"
    ]
  };
}

function buildGenericResultContent(context: ResultContext): AssessmentResultContent {
  const dominant = context.dominant;
  const secondary = context.secondary;

  const summaryLabel = dominant
    ? `${dominant.label} pattern`
    : `${context.assessment.title} profile`;
  const summaryTitle = dominant
    ? `${dominant.label} appears to be the strongest active signal right now`
    : `${context.assessment.title} result preview`;
  const summaryNarrative = dominant
    ? `${dominant.interpretation} ${
        secondary && bandAtLeast(secondary.band, "moderate")
          ? `A secondary layer of ${secondary.label.toLowerCase()} suggests ${secondary.interpretation.toLowerCase()}.`
          : ""
      } ${context.contextMarkers.length ? `Context markers point toward ${context.contextMarkers.slice(0, 2).join(" and ").replace(/_/g, " ")}.` : ""}`.trim()
    : context.assessment.previewPromise;
  const summaryDescriptor =
    "Deterministic scoring indicates a coherent pattern cluster rather than a single isolated signal.";

  const dominantTendencies = context.dimensionScores.slice(0, 2).map((dimension) =>
    createTendency(
      dimension.key,
      dimension.label,
      dimension.interpretation,
      dimension.band,
      [dimension.key]
    )
  );
  const protectiveTendencies = context.dimensionScores
    .slice(-2)
    .reverse()
    .map((dimension) =>
      createTendency(
        `${dimension.key}-protective`,
        `${dimension.label} is less dominant`,
        `This score suggests ${dimension.label.toLowerCase()} is not the main force shaping the current pattern.`,
        dimension.band,
        [dimension.key]
      )
    );
  const frictionAreas = dominant
    ? [
        createTendency(
          `${dominant.key}-friction`,
          `${dominant.label} is creating the most friction`,
          dominant.interpretation,
          dominant.band,
          [dominant.key]
        )
      ]
    : [];
  const patternClusters =
    dominant && secondary
      ? [
          createCluster(
            `${dominant.key}-${secondary.key}-cluster`,
            `${dominant.label} with ${secondary.label.toLowerCase()}`,
            `The strongest signals cluster around ${dominant.label.toLowerCase()} with a supporting layer of ${secondary.label.toLowerCase()}.`,
            maxBand(dominant.band, secondary.band),
            [dominant.key, secondary.key]
          )
        ]
      : [];
  const previewInsights = [
    dominant
      ? createInsight(
          `${dominant.key}-preview`,
          dominant.label,
          dominant.interpretation,
          "primary",
          [dominant.key]
        )
      : null,
    secondary
      ? createInsight(
          `${secondary.key}-preview`,
          secondary.label,
          secondary.interpretation,
          "secondary",
          [secondary.key]
        )
      : null,
    context.contextMarkers.length
      ? createInsight(
          "context-preview",
          "Context sensitivity",
          `This pattern appears to intensify around ${context.contextMarkers
            .slice(0, 2)
            .join(" and ")
            .replace(/_/g, " ")}.`,
          "caution",
          []
        )
      : null
  ].filter((value): value is ResultInsight => Boolean(value));
  const previewHighlights = [
    context.assessment.previewPromise,
    ...previewInsights.map((insight) => insight.body)
  ].slice(0, 4);

  return {
    summaryLabel,
    summaryTitle,
    summaryNarrative,
    summaryDescriptor,
    previewHighlights,
    previewInsights,
    dominantTendencies,
    protectiveTendencies,
    frictionAreas,
    patternClusters,
    premiumBoundary: buildPremiumBoundary(context.assessment),
    relatedRecommendations: buildGenericRelatedRecommendations(context),
    bundleSuggestion: buildGenericBundleSuggestion(context),
    membershipUpsell: buildGenericMembershipUpsell(context)
  };
}

function buildCondescendingResultContent(
  context: ResultContext
): AssessmentResultContent {
  const status = context.scoresByKey.status_signaling;
  const dismissive = context.scoresByKey.dismissive_delivery;
  const selfTrust = context.scoresByKey.self_trust_erosion;
  const boundary = context.scoresByKey.boundary_pressure;

  const deniableHierarchy =
    bandAtLeast(dismissive.band, "elevated") && bandAtLeast(status.band, "elevated");
  const selfTrustHit =
    bandAtLeast(selfTrust.band, "elevated") && bandAtLeast(boundary.band, "elevated");
  const premiumBoundary = {
    ...buildPremiumBoundary(context.assessment),
    previewNarrative:
      "The preview shows whether this dynamic reads as awkward, quietly superior, or already affecting your footing. It stops before the fuller interpretation of power, deniability, and boundary impact.",
    lockedNarrative:
      "The full report goes further into how the dynamic works, where the emotional pressure sits, how it changes your behavior, and whether it belongs in a wider red-flag context."
  };

  const summaryLabel = deniableHierarchy
    ? "Deniable diminishment pattern"
    : selfTrustHit
      ? "Quiet self-trust erosion pattern"
      : bandAtLeast(status.band, "elevated")
        ? "Status-weighted condescension pattern"
        : "Subtle condescension pattern";
  const summaryTitle = deniableHierarchy
    ? "The dynamic reads more like quiet superiority than blunt hostility."
    : selfTrustHit
      ? "The most expensive part of the pattern may be what it does to your internal footing."
      : "This looks more like a repeatable diminishment pattern than one awkward exchange.";
  const summaryNarrative = deniableHierarchy
    ? "Your answers suggest a pattern where superiority is carried through tone, correction, and framing rather than overt attack. That usually makes the interaction feel real while still staying difficult to challenge cleanly."
    : selfTrustHit
      ? "The strongest signal is not just that the exchange feels diminishing, but that it steadily reshapes how much you trust your own read of it. That combination tends to make boundaries harder to hold in real time."
      : "The result suggests repeated condescension rather than isolated friction, with the cost showing up through tone, deniability, or the pressure to absorb it quietly.";

  const previewInsights = [
    createInsight(
      "condescension-delivery",
      "How the pattern lands",
      deniableHierarchy
        ? "The pattern appears to rely on tone, timing, and status cues more than anything explicit on the surface."
        : "The central issue appears to be how the exchange lands, not only what is literally being said.",
      "primary",
      ["dismissive_delivery", "status_signaling"]
    ),
    createInsight(
      "condescension-self-trust",
      "Internal aftereffect",
      bandAtLeast(selfTrust.band, "elevated")
        ? "The private cost may be higher than the moment itself, especially if you leave more self-editing, doubtful, or quietly off balance afterward."
        : "The interaction may still be irritating, but the deeper hit to self-trust appears more contained.",
      selfTrustHit ? "caution" : "secondary",
      ["self_trust_erosion"]
    ),
    createInsight(
      "condescension-boundary",
      "Boundary reality",
      bandAtLeast(boundary.band, "elevated")
        ? "One of the key questions is whether this is merely unpleasant or already narrowing how directly you feel able to respond."
        : "Some room to answer, disagree, or step back still appears available, which matters.",
      bandAtLeast(boundary.band, "elevated") ? "caution" : "protective",
      ["boundary_pressure"]
    )
  ];

  const dominantTendencies = [
    createTendency(
      "deniable-superiority",
      "Deniable superiority cues",
      "The interaction seems to preserve plausible deniability while still shifting status and credibility.",
      maxBand(status.band, dismissive.band),
      ["status_signaling", "dismissive_delivery"]
    ),
    createTendency(
      "self-protection-editing",
      "Self-editing around the dynamic",
      "You may already be bracing, editing, or softening your own expression in anticipation of how the interaction will land.",
      maxBand(selfTrust.band, boundary.band),
      ["self_trust_erosion", "boundary_pressure"]
    )
  ];

  const protectiveTendencies = [
    createTendency(
      "read-intact",
      "Your read is still partly intact",
      bandAtLeast(selfTrust.band, "moderate")
        ? "Even with strain present, there is still some awareness that the pattern is real and not purely imagined."
        : "The lower self-trust erosion score suggests your internal read of the situation is holding up reasonably well.",
      selfTrust.band,
      ["self_trust_erosion"]
    ),
    createTendency(
      "response-room",
      "There may still be some response room",
      bandAtLeast(boundary.band, "elevated")
        ? "The current pattern is narrowing your response options, which is important to notice early."
        : "The lower boundary pressure score suggests the dynamic has not fully boxed in how you can respond or step back.",
      boundary.band,
      ["boundary_pressure"]
    )
  ];

  const frictionAreas = [
    createTendency(
      "tone-versus-proof",
      "Tone is doing more than the literal words",
      "The most destabilizing part of this pattern may be that it is felt through delivery and timing rather than explicit statements.",
      maxBand(status.band, dismissive.band),
      ["status_signaling", "dismissive_delivery"]
    ),
    createTendency(
      "self-trust-boundary-friction",
      "Self-trust and boundaries may be linked",
      "When you leave the interaction unsure of your own read, it becomes harder to answer the behavior directly or trust yourself enough to pull back.",
      maxBand(selfTrust.band, boundary.band),
      ["self_trust_erosion", "boundary_pressure"]
    )
  ];

  const patternClusters = [
    createCluster(
      "condescension-cluster",
      deniableHierarchy
        ? "Hierarchy carried through deniability"
        : "Subtle superiority with internal aftereffect",
      deniableHierarchy
        ? "Status signaling and dismissive delivery are clustering together, which often produces a pattern that feels polished on the surface and reducing underneath."
        : "The dynamic appears to cluster around repeated diminishment with emotional residue that lingers after the interaction ends.",
      maxBand(status.band, dismissive.band, selfTrust.band),
      ["status_signaling", "dismissive_delivery", "self_trust_erosion"]
    )
  ];

  const relatedRecommendations = context.assessment.relatedAssessments.map(
    (recommendation) => {
      const isToxicFollowUp =
        recommendation.slug === "toxic-pattern-and-red-flag-report" &&
        (selfTrustHit || bandAtLeast(boundary.band, "high"));
      const isAttachmentFollowUp =
        recommendation.slug === "attachment-and-relationship-style-report" &&
        (hasMarker(context, "anticipatory_self_editing") ||
          bandAtLeast(boundary.band, "elevated"));

      return {
        ...recommendation,
        reason:
          recommendation.slug === "toxic-pattern-and-red-flag-report"
            ? isToxicFollowUp
              ? "This looks worth comparing against a stronger red-flag lens because the pattern may be moving beyond subtle diminishment into real destabilization."
              : "Useful if you want to compare subtle diminishment with more direct instability, manipulation, or reality-confusion."
            : recommendation.slug === "attachment-and-relationship-style-report"
              ? isAttachmentFollowUp
                ? "This is a strong next step if the dynamic keeps pulling you into appeasing, protest, or reassurance-seeking patterns."
                : "Useful if this dynamic repeatedly hooks into closeness, reassurance, or pursuit patterns."
              : recommendation.reason,
        matchStrength: isToxicFollowUp || isAttachmentFollowUp ? "strong" : recommendationStrength(recommendation.recommendationType)
      };
    }
  );

  return {
    summaryLabel,
    summaryTitle,
    summaryNarrative,
    summaryDescriptor:
      "This profile reads as a relationship-dynamic signal, not a broad personality judgment.",
    previewHighlights: [
      "The preview can show whether the pattern is primarily status-driven, tone-driven, or self-trust eroding.",
      ...previewInsights.map((insight) => insight.body)
    ].slice(0, 4),
    previewInsights,
    dominantTendencies,
    protectiveTendencies,
    frictionAreas,
    patternClusters,
    premiumBoundary,
    relatedRecommendations,
    bundleSuggestion: {
      id: "relationship-clarity-bundle",
      title: "Relationship clarity bundle",
      description:
        "Best when you want to place subtle condescension beside stronger red-flag or attachment dynamics instead of reading it in isolation.",
      assessmentSlugs: [
        context.assessment.slug,
        "toxic-pattern-and-red-flag-report",
        "attachment-and-relationship-style-report"
      ],
      rationale:
        "This result often sits near wider relationship-boundary questions rather than standing alone."
    },
    membershipUpsell: {
      title: "This result gets more useful when you can compare it against other relationship patterns over time.",
      description:
        "Membership later makes the most sense when you want to compare condescension, attachment, red-flag, and recovery dynamics in one private library instead of treating each result as separate.",
      benefits: [
        "Keep relationship-pattern reports in one private library",
        "Compare subtle signals without losing the earlier context",
        "Add future personalized interpretation without losing the original score profile"
      ]
    }
  };
}

function buildImposterResultContent(context: ResultContext): AssessmentResultContent {
  const discounting = context.scoresByKey.achievement_discounting;
  const exposure = context.scoresByKey.exposure_fear;
  const praise = context.scoresByKey.praise_resistance;
  const comparison = context.scoresByKey.comparison_pressure;
  const overprep = context.scoresByKey.overpreparation_loop;

  const exposureLoop =
    bandAtLeast(exposure.band, "elevated") && bandAtLeast(overprep.band, "elevated");
  const praiseGap =
    bandAtLeast(discounting.band, "elevated") && bandAtLeast(praise.band, "elevated");
  const premiumBoundary = {
    ...buildPremiumBoundary(context.assessment),
    previewNarrative:
      "The preview shows which part of the loop is loudest: discounting, exposure, praise resistance, comparison, or overpreparation. It stops before the fuller interpretation of internal pressure and work impact.",
    lockedNarrative:
      "The full report goes deeper into emotional pressure points, performance patterns, hidden rules keeping the loop alive, and steadier ways to reduce the pressure without overfunctioning."
  };

  const summaryLabel = exposureLoop
    ? "Exposure-managed performance loop"
    : praiseGap
      ? "Achievement that still does not land internally"
      : bandAtLeast(comparison.band, "elevated")
        ? "Comparison-fueled imposter pattern"
        : "Private competence-doubt pattern";
  const summaryTitle = exposureLoop
    ? "The pressure seems to come from avoiding exposure, not simply from wanting to do well."
    : praiseGap
      ? "Your result suggests evidence of competence is not landing as deeply as it should."
      : "This reads like a real imposter pattern, not ordinary uncertainty about performance.";
  const summaryNarrative = exposureLoop
    ? "Your answers suggest the loop is being maintained by visibility pressure and the feeling that more work is what keeps you safe. That can turn competence into something that has to be re-earned repeatedly."
    : praiseGap
      ? "The clearest issue appears to be that praise and achievement are not fully landing. When strong outcomes keep being translated into luck, effort, or temporary relief, confidence struggles to accumulate."
      : "The result suggests a repeatable confidence gap in which self-evaluation, comparison, or overfunctioning are doing more emotional work than they appear to from the outside.";

  const previewInsights = [
    createInsight(
      "imposter-pressure",
      "Internal pressure style",
      exposureLoop
        ? "You appear to carry a high internal pressure to feel fully legitimate before you let yourself settle."
        : "The strongest pressure may be internal rather than external, with self-evaluation staying harder to satisfy than the actual demands around you.",
      "primary",
      ["exposure_fear", "overpreparation_loop"]
    ),
    createInsight(
      "imposter-evidence",
      "How evidence lands",
      praiseGap
        ? "Your responses suggest success often gets converted into something explainable away before it has time to settle into self-trust."
        : "The result suggests a gap between what other people can see and what you allow yourself to internalize as real.",
      "secondary",
      ["achievement_discounting", "praise_resistance"]
    ),
    createInsight(
      "imposter-comparison",
      "Comparison strain",
      bandAtLeast(comparison.band, "elevated")
        ? "You may be more affected by other people’s apparent ease than you openly show, which can quietly distort your sense of what competent should feel like."
        : "Comparison is present, but it does not appear to be the deepest driver of the pattern.",
      bandAtLeast(comparison.band, "elevated") ? "caution" : "protective",
      ["comparison_pressure"]
    )
  ];

  const dominantTendencies = [
    createTendency(
      "competence-not-landing",
      "Competence is not fully landing internally",
      "The result suggests performance can be visible on the outside while still feeling unconvincing from the inside.",
      maxBand(discounting.band, praise.band),
      ["achievement_discounting", "praise_resistance"]
    ),
    createTendency(
      "safety-through-effort",
      "Effort is being used as emotional safety",
      "Extra work appears to function partly as protection against exposure, not only as diligence.",
      maxBand(exposure.band, overprep.band),
      ["exposure_fear", "overpreparation_loop"]
    )
  ];

  const protectiveTendencies = [
    createTendency(
      "comparison-contained",
      "Comparison is not the whole story",
      bandAtLeast(comparison.band, "elevated")
        ? "Comparison pressure is active, but it is arriving alongside other stronger internal mechanisms."
        : "The lower comparison score suggests the pattern is not being driven mainly by rivalry or envy.",
      comparison.band,
      ["comparison_pressure"]
    ),
    createTendency(
      "recovery-room",
      "There is still some recovery room",
      bandAtLeast(overprep.band, "high")
        ? "The overpreparation score suggests recovery space is already being squeezed by the loop."
        : "The current result suggests the loop has not fully taken over how you stop, rest, or reset.",
      overprep.band,
      ["overpreparation_loop"]
    )
  ];

  const frictionAreas = [
    createTendency(
      "evidence-does-not-stick",
      "Evidence does not easily stick",
      "The main friction may be that real outcomes keep failing to produce durable internal certainty.",
      maxBand(discounting.band, praise.band),
      ["achievement_discounting", "praise_resistance"]
    ),
    createTendency(
      "visibility-cost",
      "Visibility adds cost",
      "Responsibility, praise, and recognition may be creating more private threat than reassurance.",
      maxBand(exposure.band, overprep.band),
      ["exposure_fear", "overpreparation_loop"]
    )
  ];

  const patternClusters = [
    createCluster(
      "imposter-cluster",
      exposureLoop
        ? "Exposure fear with compensatory overfunctioning"
        : "Competence discounting with praise resistance",
      exposureLoop
        ? "Visibility pressure and extra work are clustering together, which often turns competence into something that feels conditional and fragile."
        : "Achievement discounting and praise resistance are clustering together, which makes confidence slow to accumulate even when performance is real.",
      exposureLoop
        ? maxBand(exposure.band, overprep.band)
        : maxBand(discounting.band, praise.band),
      exposureLoop
        ? ["exposure_fear", "overpreparation_loop"]
        : ["achievement_discounting", "praise_resistance"]
    )
  ];

  const relatedRecommendations = context.assessment.relatedAssessments.map(
    (recommendation) => {
      const burnoutFollowUp =
        recommendation.slug === "personality-burnout-and-stress-report" &&
        bandAtLeast(overprep.band, "elevated");
      const identityFollowUp =
        recommendation.slug === "identity-and-inner-conflict-profile" &&
        (bandAtLeast(discounting.band, "elevated") ||
          bandAtLeast(comparison.band, "elevated"));

      return {
        ...recommendation,
        reason:
          recommendation.slug === "personality-burnout-and-stress-report"
            ? burnoutFollowUp
              ? "This is a strong next step if self-doubt is already turning into chronic overwork, exhaustion, or recovery difficulty."
              : "Useful if the loop is starting to show up as chronic overwork, exhaustion, or trouble stepping down."
            : recommendation.slug === "identity-and-inner-conflict-profile"
              ? identityFollowUp
                ? "This looks especially relevant if confidence strain is tied to role confusion, authenticity pressure, or a shaky sense of who you are when you are not performing."
                : "Useful if the self-doubt feels tied to role confusion, authenticity pressure, or a deeper identity split."
              : recommendation.reason,
        matchStrength: burnoutFollowUp || identityFollowUp ? "strong" : recommendationStrength(recommendation.recommendationType)
      };
    }
  );

  return {
    summaryLabel,
    summaryTitle,
    summaryNarrative,
    summaryDescriptor:
      "This profile focuses on the mechanics of self-doubt, not on diagnosing ability or worth.",
    previewHighlights: [
      "The preview identifies whether the strongest driver is discounting, exposure fear, comparison, or compensatory overpreparation.",
      ...previewInsights.map((insight) => insight.body)
    ].slice(0, 4),
    previewInsights,
    dominantTendencies,
    protectiveTendencies,
    frictionAreas,
    patternClusters,
    premiumBoundary,
    relatedRecommendations,
    bundleSuggestion: {
      id: "performance-pressure-bundle",
      title: "Performance pressure bundle",
      description:
        "Useful when private self-doubt appears to overlap with burnout, identity strain, or chronic overfunctioning.",
      assessmentSlugs: [
        context.assessment.slug,
        "identity-and-inner-conflict-profile",
        "personality-burnout-and-stress-report"
      ],
      rationale:
        "This result frequently sits at the intersection of confidence, role identity, and exhaustion."
    },
    membershipUpsell: {
      title: "This pattern becomes clearer when you can track it over time rather than reading it once.",
      description:
        "Membership later fits users who want to compare imposter, identity, and burnout reports as the pattern shifts with workload, visibility, pressure, and recovery.",
      benefits: [
        "Keep performance-related reports in one private library",
        "Track whether the pattern is moving toward burnout, identity strain, or recovery",
        "Add future personalized interpretation on top of the same scored profile"
      ]
    }
  };
}

function buildInfatuationResultContent(
  context: ResultContext
): AssessmentResultContent {
  const focus = context.scoresByKey.intrusive_focus;
  const uncertainty = context.scoresByKey.uncertainty_reinforcement;
  const fantasy = context.scoresByKey.fantasy_projection;
  const selfShift = context.scoresByKey.self_abandonment;
  const release = context.scoresByKey.release_resistance;

  const uncertaintyLoop =
    bandAtLeast(uncertainty.band, "elevated") && bandAtLeast(focus.band, "elevated");
  const meaningHeavyLoop =
    bandAtLeast(fantasy.band, "elevated") && bandAtLeast(release.band, "elevated");
  const premiumBoundary = {
    ...buildPremiumBoundary(context.assessment),
    previewNarrative:
      "The preview shows whether the loop is being driven more by mental reentry, ambiguity, fantasy, self-disruption, or difficulty releasing it. It stops before the deeper attachment interpretation.",
    lockedNarrative:
      "The full report goes further into what is reinforcing the loop, how it shows up in daily life, where hope and evidence split, and what creates more stability and clarity."
  };

  const summaryLabel = uncertaintyLoop
    ? "Mixed-signal reinforcement loop"
    : meaningHeavyLoop
      ? "Meaning-heavy attachment loop"
      : bandAtLeast(selfShift.band, "elevated")
        ? "Attachment crowding out self-anchoring"
        : "Persistent attachment loop";
  const summaryTitle = uncertaintyLoop
    ? "Ambiguity appears to be intensifying the attachment instead of settling it."
    : meaningHeavyLoop
      ? "Part of the grip seems to be coming from meaning that has not fully softened."
      : "The attachment looks persistent enough to be affecting ordinary life, not just private feeling.";
  const summaryNarrative = uncertaintyLoop
    ? "Your responses suggest the loop is being reinforced by ambiguity, mixed signals, and the urge to keep scanning for clarity. That tends to keep the bond emotionally active even when resolution would be more stabilizing."
    : meaningHeavyLoop
      ? "The result suggests this pattern is carrying more imagined continuity or emotional meaning than the relationship itself is reliably providing. That is often what keeps release harder than expected."
      : "The attachment appears strong enough to affect attention, routine, or emotional steadiness, even if the exact reinforcement mechanism is more mixed.";

  const previewInsights = [
    createInsight(
      "infatuation-focus",
      "What keeps the loop active",
      uncertaintyLoop
        ? "You may be more affected by ambiguity and mixed signals than you openly show, which keeps attention returning to the relationship even when it is draining."
        : "The pattern seems less about dramatic emotion and more about repeated mental re-entry that is difficult to shut down.",
      "primary",
      ["intrusive_focus", "uncertainty_reinforcement"]
    ),
    createInsight(
      "infatuation-fantasy",
      "How meaning expands",
      meaningHeavyLoop
        ? "Part of the attachment may be living in interpretation, imagined continuity, or unfinished meaning rather than in direct reality alone."
        : "Fantasy and projection are present, but they may not be the main engine of the loop.",
      meaningHeavyLoop ? "secondary" : "protective",
      ["fantasy_projection"]
    ),
    createInsight(
      "infatuation-self",
      "Cost to ordinary life",
      bandAtLeast(selfShift.band, "elevated")
        ? "The clearest cost may be how much the attachment is reorganizing your attention, mood, or everyday self-positioning."
        : "Some parts of your routine and self-anchoring still appear intact, which matters.",
      bandAtLeast(selfShift.band, "elevated") ? "caution" : "protective",
      ["self_abandonment", "release_resistance"]
    )
  ];

  const dominantTendencies = [
    createTendency(
      "uncertainty-pull",
      "Uncertainty has emotional pull",
      "The attachment seems to gain intensity from ambiguity rather than relief from clarity.",
      maxBand(uncertainty.band, focus.band),
      ["uncertainty_reinforcement", "intrusive_focus"]
    ),
    createTendency(
      "meaning-carrying-loop",
      "Meaning is helping carry the loop",
      "Imagined continuity, unfinished meaning, or private narrative may be sustaining attachment beyond direct evidence.",
      maxBand(fantasy.band, release.band),
      ["fantasy_projection", "release_resistance"]
    )
  ];

  const protectiveTendencies = [
    createTendency(
      "self-anchoring-intact",
      "Some self-anchoring is still intact",
      bandAtLeast(selfShift.band, "elevated")
        ? "The current result suggests the loop is already pulling at ordinary routines and self-positioning."
        : "The lower self-abandonment score suggests the attachment has not fully overtaken how you live the rest of your life.",
      selfShift.band,
      ["self_abandonment"]
    ),
    createTendency(
      "distance-can-still-help",
      "Distance may still help",
      bandAtLeast(release.band, "high")
        ? "Release resistance is strong, so distance may not feel immediately relieving even if it is still useful."
        : "The release-resistance score suggests real distance still has room to reduce the loop over time.",
      release.band,
      ["release_resistance"]
    )
  ];

  const frictionAreas = [
    createTendency(
      "attention-capture",
      "Attention keeps getting recaptured",
      "The loop appears to keep reclaiming mental space, which makes emotional disengagement harder than intention alone would suggest.",
      maxBand(focus.band, uncertainty.band),
      ["intrusive_focus", "uncertainty_reinforcement"]
    ),
    createTendency(
      "hope-versus-evidence",
      "Hope and evidence may be pulling in different directions",
      "Part of the difficulty may be that enough evidence exists to loosen the loop, but the emotional significance has not fully softened with it.",
      maxBand(fantasy.band, release.band),
      ["fantasy_projection", "release_resistance"]
    )
  ];

  const patternClusters = [
    createCluster(
      "infatuation-cluster",
      uncertaintyLoop
        ? "Uncertainty-fed attachment"
        : meaningHeavyLoop
          ? "Fantasy-supported release resistance"
          : "Persistent fixation with self-shift",
      uncertaintyLoop
        ? "Intrusive focus and uncertainty reinforcement are clustering together, which often turns mixed signals into fuel."
        : meaningHeavyLoop
          ? "Fantasy projection and release resistance are clustering together, which often keeps emotional release slower than direct evidence would predict."
          : "The pattern appears to combine fixation with meaningful cost to ordinary life and self-anchoring.",
      uncertaintyLoop
        ? maxBand(focus.band, uncertainty.band)
        : meaningHeavyLoop
          ? maxBand(fantasy.band, release.band)
          : maxBand(focus.band, selfShift.band),
      uncertaintyLoop
        ? ["intrusive_focus", "uncertainty_reinforcement"]
        : meaningHeavyLoop
          ? ["fantasy_projection", "release_resistance"]
          : ["intrusive_focus", "self_abandonment"]
    )
  ];

  const relatedRecommendations = context.assessment.relatedAssessments.map(
    (recommendation) => {
      const attachmentFollowUp =
        recommendation.slug === "attachment-and-relationship-style-report" &&
        (uncertaintyLoop || bandAtLeast(selfShift.band, "elevated"));
      const closureFollowUp =
        recommendation.slug === "closure-and-emotional-recovery-report" &&
        (meaningHeavyLoop || bandAtLeast(release.band, "elevated"));

      return {
        ...recommendation,
        reason:
          recommendation.slug === "attachment-and-relationship-style-report"
            ? attachmentFollowUp
              ? "This is a strong next step if the fixation looks tied to wider reassurance, closeness, protest, or distance patterns."
              : "Useful if the loop feels connected to a broader attachment style rather than to this one person alone."
            : recommendation.slug === "closure-and-emotional-recovery-report"
              ? closureFollowUp
                ? "This looks especially relevant if the hardest part is unfinished meaning, lingering hope, or difficulty releasing the bond."
                : "Useful if the loop is being sustained by unfinished meaning, lingering hope, or difficulty making emotional distance stick."
              : recommendation.reason,
        matchStrength: attachmentFollowUp || closureFollowUp ? "strong" : recommendationStrength(recommendation.recommendationType)
      };
    }
  );

  return {
    summaryLabel,
    summaryTitle,
    summaryNarrative,
    summaryDescriptor:
      "This profile describes an attachment pattern, not a diagnosis or a judgment about what you should feel.",
    previewHighlights: [
      "The preview shows whether the loop is being led by uncertainty, intrusive focus, fantasy, or difficulty releasing it.",
      ...previewInsights.map((insight) => insight.body)
    ].slice(0, 4),
    previewInsights,
    dominantTendencies,
    protectiveTendencies,
    frictionAreas,
    patternClusters,
    premiumBoundary,
    relatedRecommendations,
    bundleSuggestion: {
      id: "attachment-recovery-bundle",
      title: "Attachment and recovery bundle",
      description:
        "Useful when you want to compare fixation, attachment style, and closure difficulty in one connected path.",
      assessmentSlugs: [
        context.assessment.slug,
        "attachment-and-relationship-style-report",
        "closure-and-emotional-recovery-report"
      ],
      rationale:
        "This result often sits between attachment style questions and recovery or closure needs."
    },
    membershipUpsell: {
      title: "This result becomes more useful when repeated relationship patterns can be compared side by side.",
      description:
        "Membership later makes sense for users moving between obsession, attachment, and closure reports rather than treating each loop as unrelated.",
      benefits: [
        "Keep attachment, obsession, and recovery reports together in one private library",
        "Compare whether the pattern is driven more by uncertainty, fantasy, or release difficulty",
        "Add future personalized relationship interpretation without losing the original score profile"
      ]
    }
  };
}

export function buildAssessmentResultContent(
  assessment: AssessmentDefinition,
  dimensionScores: DimensionScore[],
  contextMarkers: string[]
): AssessmentResultContent {
  const scoresByKey = Object.fromEntries(
    dimensionScores.map((dimension) => [dimension.key, dimension])
  ) as Record<string, DimensionScore>;
  const context: ResultContext = {
    assessment,
    dimensionScores,
    scoresByKey,
    dominant: dimensionScores[0] ?? null,
    secondary: dimensionScores[1] ?? null,
    contextMarkers
  };

  switch (assessment.slug) {
    case "condescending-behavior-decoder":
      return applyCrossAssessmentRecommendationLayer(
        context,
        buildCondescendingResultContent(context)
      );
    case "imposter-syndrome-deep-report":
      return applyCrossAssessmentRecommendationLayer(
        context,
        buildImposterResultContent(context)
      );
    case "relationship-infatuation-obsession-analysis":
      return applyCrossAssessmentRecommendationLayer(
        context,
        buildInfatuationResultContent(context)
      );
    default:
      return applyCrossAssessmentRecommendationLayer(
        context,
        buildGenericResultContent(context)
      );
  }
}
