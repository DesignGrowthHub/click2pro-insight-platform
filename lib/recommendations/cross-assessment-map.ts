export type InsightClusterKey =
  | "power-and-boundaries"
  | "relationship-interpretation"
  | "attachment-intensity"
  | "recovery-and-release"
  | "self-pressure"
  | "identity-and-self-trust"
  | "burnout-and-overload"
  | "meaning-and-motivation";

export type RecommendationLinkDefinition = {
  slug: string;
  recommendationType: "adjacent" | "deepen" | "stabilize";
  baseScore: number;
  clusterKey: InsightClusterKey;
  rationale: string;
  bundleKey?: string;
  dimensionTriggers?: Array<{
    dimensionKey: string;
    boost: number;
    reason: string;
  }>;
};

export type CrossAssessmentMapEntry = {
  assessmentSlug: string;
  clusters: InsightClusterKey[];
  bundleKeys: string[];
  links: RecommendationLinkDefinition[];
};

export type RecommendationBundleBlueprint = {
  key: string;
  title: string;
  description: string;
  assessmentSlugs: string[];
  positioning: string;
  membershipFrame: string;
};

export const insightClusterLabels: Record<InsightClusterKey, string> = {
  "power-and-boundaries": "Power and boundaries",
  "relationship-interpretation": "Relationship interpretation",
  "attachment-intensity": "Attachment intensity",
  "recovery-and-release": "Recovery and release",
  "self-pressure": "Self-pressure",
  "identity-and-self-trust": "Identity and self-trust",
  "burnout-and-overload": "Burnout and overload",
  "meaning-and-motivation": "Meaning and motivation"
};

export const recommendationBundleBlueprints: RecommendationBundleBlueprint[] = [
  {
    key: "relationship-insight-bundle",
    title: "Relationship Insight Bundle",
    description:
      "A relationship-focused bundle for users who need more than one angle on attachment, mixed signals, red flags, or recovery.",
    assessmentSlugs: [
      "relationship-infatuation-obsession-analysis",
      "attachment-and-relationship-style-report",
      "toxic-pattern-and-red-flag-report",
      "closure-and-emotional-recovery-report"
    ],
    positioning:
      "Best when one relationship pattern is clearly overlapping with attachment, boundary, or recovery questions.",
    membershipFrame:
      "Membership becomes the broader next step when relationship reports are likely to accumulate over time."
  },
  {
    key: "identity-self-understanding-bundle",
    title: "Identity & Self-Understanding Bundle",
    description:
      "Built for self-pressure, self-concept strain, and longer-term questions about confidence, identity, and internal contradiction.",
    assessmentSlugs: [
      "imposter-syndrome-deep-report",
      "identity-and-inner-conflict-profile",
      "emotional-detachment-nihilism-insight",
      "anhedonia-and-motivation-pattern-scan"
    ],
    positioning:
      "Useful when competence doubt, self-definition, and loss of internal clarity appear to be linked.",
    membershipFrame:
      "Membership makes more sense when the user wants to compare self-trust, identity, and motivation patterns instead of stopping at one report."
  },
  {
    key: "emotional-clarity-bundle",
    title: "Emotional Clarity Bundle",
    description:
      "A bundle for users trying to understand flattening, depletion, detachment, or difficulty reconnecting with momentum.",
    assessmentSlugs: [
      "emotional-detachment-nihilism-insight",
      "anhedonia-and-motivation-pattern-scan",
      "personality-burnout-and-stress-report",
      "closure-and-emotional-recovery-report"
    ],
    positioning:
      "Useful when the question is not only what feels heavy, but what has gone quiet, flattened, or hard to reengage.",
    membershipFrame:
      "Membership is the better long-term path when emotional clarity needs to be tracked across multiple recurring states."
  },
  {
    key: "boundary-interpretation-bundle",
    title: "Boundary & Interpretation Bundle",
    description:
      "Built for users who are trying to understand dismissive behavior, relational confusion, and the line between discomfort and a meaningful warning signal.",
    assessmentSlugs: [
      "condescending-behavior-decoder",
      "toxic-pattern-and-red-flag-report",
      "attachment-and-relationship-style-report"
    ],
    positioning:
      "Useful when the core question is whether a difficult interaction reflects pattern, power, attachment, or all three together.",
    membershipFrame:
      "Membership becomes more useful when recurring relational interpretation questions keep resurfacing across different people or situations."
  }
];

export const crossAssessmentMap: CrossAssessmentMapEntry[] = [
  {
    assessmentSlug: "condescending-behavior-decoder",
    clusters: ["power-and-boundaries", "relationship-interpretation"],
    bundleKeys: ["boundary-interpretation-bundle", "relationship-insight-bundle"],
    links: [
      {
        slug: "toxic-pattern-and-red-flag-report",
        recommendationType: "deepen",
        baseScore: 12,
        clusterKey: "power-and-boundaries",
        rationale:
          "Dismissive behavior often makes more sense when it is compared against broader red-flag and boundary patterns rather than read in isolation.",
        bundleKey: "boundary-interpretation-bundle",
        dimensionTriggers: [
          {
            dimensionKey: "dismissive_delivery",
            boost: 3,
            reason:
              "A stronger dismissive-delivery signal often means the broader relational pattern deserves a second look."
          },
          {
            dimensionKey: "boundary_pressure",
            boost: 3,
            reason:
              "When boundary pressure is dominant, the next useful question is often whether the pattern reflects a larger red-flag dynamic."
          }
        ]
      },
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "adjacent",
        baseScore: 9,
        clusterKey: "relationship-interpretation",
        rationale:
          "If another person's tone keeps pulling attention, attachment sensitivity may be shaping how the interaction is being interpreted and held onto.",
        bundleKey: "boundary-interpretation-bundle"
      },
      {
        slug: "closure-and-emotional-recovery-report",
        recommendationType: "stabilize",
        baseScore: 6,
        clusterKey: "recovery-and-release",
        rationale:
          "When a dismissive interaction keeps replaying mentally, a recovery-oriented follow-up can help clarify what is still unresolved."
      }
    ]
  },
  {
    assessmentSlug: "imposter-syndrome-deep-report",
    clusters: ["self-pressure", "identity-and-self-trust"],
    bundleKeys: ["identity-self-understanding-bundle"],
    links: [
      {
        slug: "personality-burnout-and-stress-report",
        recommendationType: "deepen",
        baseScore: 12,
        clusterKey: "burnout-and-overload",
        rationale:
          "Self-doubt often becomes harder to interpret cleanly when overpreparation, recovery difficulty, and performance strain are also active.",
        dimensionTriggers: [
          {
            dimensionKey: "overpreparation_loop",
            boost: 3,
            reason:
              "Overpreparation often carries a burnout cost that deserves its own read."
          },
          {
            dimensionKey: "comparison_pressure",
            boost: 2,
            reason:
              "When comparison stays active, the user is often carrying more performance strain than the first report alone can show."
          }
        ]
      },
      {
        slug: "identity-and-inner-conflict-profile",
        recommendationType: "adjacent",
        baseScore: 10,
        clusterKey: "identity-and-self-trust",
        rationale:
          "When competence feels hard to believe from the inside, it often overlaps with a broader question about self-definition and inner contradiction.",
        bundleKey: "identity-self-understanding-bundle",
        dimensionTriggers: [
          {
            dimensionKey: "comparison_pressure",
            boost: 2,
            reason:
              "Comparison-driven self-measurement often pulls the issue beyond performance and into self-concept."
          }
        ]
      },
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "adjacent",
        baseScore: 6,
        clusterKey: "relationship-interpretation",
        rationale:
          "Some users find that competence doubt is not only internal. It also shows up in closeness, reassurance, and relational self-trust."
      }
    ]
  },
  {
    assessmentSlug: "relationship-infatuation-obsession-analysis",
    clusters: ["attachment-intensity", "relationship-interpretation"],
    bundleKeys: ["relationship-insight-bundle"],
    links: [
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "deepen",
        baseScore: 12,
        clusterKey: "attachment-intensity",
        rationale:
          "Attachment style is often the clearest second read when emotional intensity, mixed signals, and difficulty creating distance are all active.",
        bundleKey: "relationship-insight-bundle",
        dimensionTriggers: [
          {
            dimensionKey: "uncertainty_reinforcement",
            boost: 3,
            reason:
              "Mixed-signal sensitivity often becomes easier to understand once attachment regulation is mapped directly."
          },
          {
            dimensionKey: "release_resistance",
            boost: 3,
            reason:
              "Difficulty creating distance often points toward a broader attachment regulation pattern."
          }
        ]
      },
      {
        slug: "toxic-pattern-and-red-flag-report",
        recommendationType: "adjacent",
        baseScore: 10,
        clusterKey: "power-and-boundaries",
        rationale:
          "When intensity is being shaped by ambiguity, this follow-up helps clarify whether the loop is also being reinforced by unhealthy relational signals.",
        bundleKey: "relationship-insight-bundle"
      },
      {
        slug: "closure-and-emotional-recovery-report",
        recommendationType: "stabilize",
        baseScore: 8,
        clusterKey: "recovery-and-release",
        rationale:
          "If the loop stays active even when clarity is limited, a recovery-oriented follow-up can help clarify what keeps the attachment from settling."
      }
    ]
  },
  {
    assessmentSlug: "toxic-pattern-and-red-flag-report",
    clusters: ["power-and-boundaries", "relationship-interpretation"],
    bundleKeys: ["relationship-insight-bundle", "boundary-interpretation-bundle"],
    links: [
      {
        slug: "condescending-behavior-decoder",
        recommendationType: "adjacent",
        baseScore: 11,
        clusterKey: "power-and-boundaries",
        rationale:
          "This is a strong next step when the broader red-flag picture seems to include dismissive tone, subtle rank signaling, or repeated belittling."
      },
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "deepen",
        baseScore: 10,
        clusterKey: "attachment-intensity",
        rationale:
          "Boundary tolerance and attachment sensitivity often work together, especially when a user keeps staying in a pattern they can already partially name."
      },
      {
        slug: "closure-and-emotional-recovery-report",
        recommendationType: "stabilize",
        baseScore: 7,
        clusterKey: "recovery-and-release",
        rationale:
          "Once the red-flag pattern is clearer, the next question is often what still keeps the emotional loop active."
      }
    ]
  },
  {
    assessmentSlug: "emotional-detachment-nihilism-insight",
    clusters: ["meaning-and-motivation", "identity-and-self-trust"],
    bundleKeys: ["emotional-clarity-bundle", "identity-self-understanding-bundle"],
    links: [
      {
        slug: "anhedonia-and-motivation-pattern-scan",
        recommendationType: "deepen",
        baseScore: 12,
        clusterKey: "meaning-and-motivation",
        rationale:
          "Detachment and flattened motivation often need to be read together to see whether the issue is distance, depletion, or reduced reward response.",
        bundleKey: "emotional-clarity-bundle"
      },
      {
        slug: "identity-and-inner-conflict-profile",
        recommendationType: "adjacent",
        baseScore: 9,
        clusterKey: "identity-and-self-trust",
        rationale:
          "When meaning feels thin or emotionally distant, the next useful question is sometimes whether the self-narrative itself feels misaligned."
      },
      {
        slug: "personality-burnout-and-stress-report",
        recommendationType: "stabilize",
        baseScore: 8,
        clusterKey: "burnout-and-overload",
        rationale:
          "Some detachment patterns become easier to understand once sustained pressure and recovery difficulty are ruled in or out."
      }
    ]
  },
  {
    assessmentSlug: "anhedonia-and-motivation-pattern-scan",
    clusters: ["meaning-and-motivation", "burnout-and-overload"],
    bundleKeys: ["emotional-clarity-bundle", "identity-self-understanding-bundle"],
    links: [
      {
        slug: "personality-burnout-and-stress-report",
        recommendationType: "deepen",
        baseScore: 11,
        clusterKey: "burnout-and-overload",
        rationale:
          "Motivation loss often sits beside recovery strain and cognitive overload, especially when effort feels harder than usual to start or sustain.",
        bundleKey: "emotional-clarity-bundle"
      },
      {
        slug: "emotional-detachment-nihilism-insight",
        recommendationType: "adjacent",
        baseScore: 11,
        clusterKey: "meaning-and-motivation",
        rationale:
          "This follow-up helps clarify whether the pattern is mainly reduced reward response, broader detachment, or a quieter collapse in felt meaning."
      },
      {
        slug: "identity-and-inner-conflict-profile",
        recommendationType: "adjacent",
        baseScore: 7,
        clusterKey: "identity-and-self-trust",
        rationale:
          "When motivation loss creates uncertainty about direction or self-coherence, identity conflict can become part of the same pattern."
      }
    ]
  },
  {
    assessmentSlug: "personality-burnout-and-stress-report",
    clusters: ["burnout-and-overload", "self-pressure"],
    bundleKeys: ["emotional-clarity-bundle", "identity-self-understanding-bundle"],
    links: [
      {
        slug: "imposter-syndrome-deep-report",
        recommendationType: "adjacent",
        baseScore: 11,
        clusterKey: "self-pressure",
        rationale:
          "Burnout is often easier to interpret when self-doubt, overpreparation, or exposure pressure are also making the workload feel heavier than it looks."
      },
      {
        slug: "anhedonia-and-motivation-pattern-scan",
        recommendationType: "deepen",
        baseScore: 10,
        clusterKey: "meaning-and-motivation",
        rationale:
          "If pressure has started to flatten anticipation or motivation, a second read on reward and engagement can clarify what the stress pattern is costing."
      },
      {
        slug: "identity-and-inner-conflict-profile",
        recommendationType: "stabilize",
        baseScore: 7,
        clusterKey: "identity-and-self-trust",
        rationale:
          "Long-running overload sometimes spills into self-concept, indecision, and a quieter sense of internal misalignment."
      }
    ]
  },
  {
    assessmentSlug: "attachment-and-relationship-style-report",
    clusters: ["attachment-intensity", "relationship-interpretation"],
    bundleKeys: ["relationship-insight-bundle", "boundary-interpretation-bundle"],
    links: [
      {
        slug: "relationship-infatuation-obsession-analysis",
        recommendationType: "deepen",
        baseScore: 12,
        clusterKey: "attachment-intensity",
        rationale:
          "This is often the clearest second step when attachment sensitivity becomes emotionally intense, repetitive, or hard to mentally exit.",
        bundleKey: "relationship-insight-bundle"
      },
      {
        slug: "toxic-pattern-and-red-flag-report",
        recommendationType: "adjacent",
        baseScore: 10,
        clusterKey: "power-and-boundaries",
        rationale:
          "Attachment regulation can keep people in patterns that deserve a cleaner red-flag and boundary read."
      },
      {
        slug: "closure-and-emotional-recovery-report",
        recommendationType: "stabilize",
        baseScore: 8,
        clusterKey: "recovery-and-release",
        rationale:
          "If attachment remains active after the relationship itself becomes unclear or unavailable, recovery is often the next useful insight path."
      }
    ]
  },
  {
    assessmentSlug: "identity-and-inner-conflict-profile",
    clusters: ["identity-and-self-trust", "self-pressure"],
    bundleKeys: ["identity-self-understanding-bundle"],
    links: [
      {
        slug: "imposter-syndrome-deep-report",
        recommendationType: "adjacent",
        baseScore: 10,
        clusterKey: "self-pressure",
        rationale:
          "Identity conflict and competence doubt often reinforce each other, especially when the person can function well but still feel unconvinced from the inside."
      },
      {
        slug: "emotional-detachment-nihilism-insight",
        recommendationType: "deepen",
        baseScore: 9,
        clusterKey: "meaning-and-motivation",
        rationale:
          "When self-definition starts to feel unstable, questions about emotional distance, meaning, or disengagement often deserve their own read."
      },
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "adjacent",
        baseScore: 6,
        clusterKey: "relationship-interpretation",
        rationale:
          "For some users, identity strain also shows up interpersonally through reassurance needs, self-protective distance, or relationship regulation."
      }
    ]
  },
  {
    assessmentSlug: "closure-and-emotional-recovery-report",
    clusters: ["recovery-and-release", "attachment-intensity"],
    bundleKeys: ["relationship-insight-bundle", "emotional-clarity-bundle"],
    links: [
      {
        slug: "attachment-and-relationship-style-report",
        recommendationType: "adjacent",
        baseScore: 10,
        clusterKey: "attachment-intensity",
        rationale:
          "Closure difficulty is often more understandable once the underlying attachment style and reassurance pattern are clearer."
      },
      {
        slug: "relationship-infatuation-obsession-analysis",
        recommendationType: "deepen",
        baseScore: 9,
        clusterKey: "relationship-interpretation",
        rationale:
          "If the emotional loop still feels highly charged, a second read on attachment intensity and mixed-signal sensitivity may clarify what is keeping it active."
      },
      {
        slug: "toxic-pattern-and-red-flag-report",
        recommendationType: "adjacent",
        baseScore: 8,
        clusterKey: "power-and-boundaries",
        rationale:
          "Recovery can stall when the user still needs a cleaner read on whether the prior dynamic involved boundary strain or harmful relational patterns."
      }
    ]
  }
];

export function getCrossAssessmentMapEntry(assessmentSlug: string) {
  return crossAssessmentMap.find((entry) => entry.assessmentSlug === assessmentSlug) ?? null;
}

export function getBundleBlueprintByKey(bundleKey: string) {
  return recommendationBundleBlueprints.find((bundle) => bundle.key === bundleKey) ?? null;
}
