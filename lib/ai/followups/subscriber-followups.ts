import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  SubscriptionFollowUpBlueprint,
  SubscriptionFollowUpModule
} from "@/lib/types/assessment-domain";

function module(
  id: string,
  title: string,
  description: string,
  availability: SubscriptionFollowUpModule["availability"]
): SubscriptionFollowUpModule {
  return {
    id,
    title,
    description,
    availability
  };
}

function commonFutureModules() {
  return [
    module(
      "monthly-reflection-summary",
      "Monthly reflection summary",
      "Summarize recurring tension areas, steadier moments, and notable changes across the user's recent reports.",
      "future"
    ),
    module(
      "connected-pattern-suggestions",
      "Connected-pattern suggestions",
      "Recommend adjacent reports when two or more owned reports point toward the same deeper loop.",
      "future"
    )
  ];
}

function defaultReflectionThemes(assessment: AssessmentDefinition) {
  return [
    `${assessment.category.toLowerCase()} patterns over time`,
    "changes in intensity or clarity",
    "which triggers stayed active",
    "what felt steadier than before"
  ];
}

export function buildSubscriptionFollowUpBlueprint(
  assessment: AssessmentDefinition,
  resultProfile: AssessmentResultProfile | null | undefined
): SubscriptionFollowUpBlueprint {
  const dimensionScores = resultProfile?.dimensionScores ?? [];

  const dominantLabels = dimensionScores
    .slice(0, 2)
    .map((dimension) => dimension.label.toLowerCase());

  switch (assessment.slug) {
    case "condescending-behavior-decoder":
      return {
        title: "Subscriber follow-up can compare relational dynamics over time.",
        description:
          "A later member-only layer can compare repeated dismissive interactions, track where self-trust changes after contact, and generate calmer narratives about evolving boundary strain.",
        modules: [
          module(
            "interaction-comparison",
            "Interaction comparison narrative",
            "Compare two reports to show whether the same dismissive pattern is repeating with the same person or across different relationships.",
            "subscriber_only"
          ),
          module(
            "boundary-strain-checkin",
            "Boundary strain check-in",
            "Track how much self-editing, anticipatory caution, or proof-seeking remains active after later interaction cycles.",
            "subscriber_only"
          ),
          module(
            "what-changed-since-last-report",
            "What changed since last report",
            "Generate a short comparison narrative about whether clarity, self-trust, or relational pressure shifted since the previous report.",
            "subscriber_only"
          ),
          ...commonFutureModules()
        ],
        reflectionThemes: [
          "whether the interaction is still leaving you smaller or more careful",
          "what changed in your self-trust after repeated contact",
          "where deniability is still delaying action",
          "whether boundary strain is growing or easing"
        ],
        comparisonNarrativeIntent:
          "Explain whether the dismissive pattern is becoming clearer, more containable, or more costly across time."
      };
    case "imposter-syndrome-deep-report":
      return {
        title: "Subscriber follow-up can map self-pressure drift instead of treating it as one fixed trait.",
        description:
          "A later follow-up layer can compare how competence doubt, visibility strain, and comparison sensitivity shift after specific work cycles, achievements, or setbacks.",
        modules: [
          module(
            "pressure-comparison",
            "Pressure comparison narrative",
            "Compare the current report against a prior one to show whether the pressure pattern is loosening, relocating, or intensifying.",
            "subscriber_only"
          ),
          module(
            "evidence-integration-check",
            "Evidence integration check",
            "Track whether external evidence is registering more fully or still being treated as temporary.",
            "subscriber_only"
          ),
          module(
            "reflection-prompts",
            "Follow-up reflection prompts",
            "Offer short prompts tied to performance, praise, exposure, and comparison moments.",
            "subscriber_only"
          ),
          ...commonFutureModules()
        ],
        reflectionThemes: [
          "where self-doubt still overrides evidence",
          "what happens after visible success",
          "whether comparison pressure is changing",
          "how much work still feels like emotional proof"
        ],
        comparisonNarrativeIntent:
          "Interpret whether the self-pressure pattern is becoming more grounded, more hidden, or more tied to visibility and comparison."
      };
    case "relationship-infatuation-obsession-analysis":
      return {
        title: "Subscriber follow-up can compare attachment loops instead of treating them as isolated events.",
        description:
          "A future member layer can compare how mental occupancy, mixed-signal sensitivity, and distance difficulty change across different relationship situations or later check-ins.",
        modules: [
          module(
            "attachment-loop-comparison",
            "Attachment loop comparison",
            "Compare a later report against this one to show whether the loop is intensifying, softening, or changing form.",
            "subscriber_only"
          ),
          module(
            "clarity-checkin",
            "Clarity versus fantasy check-in",
            "Track whether the loop is still being fueled by ambiguity, storyline, repeated contact, or unresolved hope.",
            "subscriber_only"
          ),
          module(
            "ongoing-reflection-prompts",
            "Ongoing reflection prompts",
            "Offer short prompts about distance, contact, preoccupation, and whether life is returning to fuller view.",
            "subscriber_only"
          ),
          ...commonFutureModules()
        ],
        reflectionThemes: [
          "whether ambiguity is still driving the loop",
          "what contact or distance is changing",
          "how much ordinary life is returning to view",
          "whether clarity is improving faster than preoccupation"
        ],
        comparisonNarrativeIntent:
          "Explain how the attachment loop is evolving and whether clarity, distance, or private storyline now carries more weight."
      };
    default:
      return {
        title: "Subscriber follow-up can turn one report into an ongoing insight thread.",
        description:
          `A future follow-up layer can compare how ${dominantLabels.join(
            " and "
          )} change over time, then translate that into calmer narratives about what shifted, what stayed active, and what became easier to manage.`,
        modules: [
          module(
            "report-comparison-narrative",
            "Report comparison narrative",
            "Compare a current report to a prior one and explain what changed in intensity, context, and friction.",
            "subscriber_only"
          ),
          module(
            "follow-up-reflection-prompts",
            "Follow-up reflection prompts",
            "Offer future prompts shaped by the strongest tension areas in this result.",
            "subscriber_only"
          ),
          module(
            "what-changed-since-last-report",
            "What changed since last report",
            "Generate a concise narrative about whether the pattern has eased, intensified, or changed context since the previous report.",
            "subscriber_only"
          ),
          ...commonFutureModules()
        ],
        reflectionThemes: defaultReflectionThemes(assessment),
        comparisonNarrativeIntent:
          "Explain what changed between reports, which tension areas stayed active, and where steadiness has improved."
      };
  }
}
