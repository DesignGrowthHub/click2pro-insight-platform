import {
  attachQuestionIdsToSections,
  createChoiceQuestion,
  createScaleQuestion
} from "@/lib/assessment-builders";
import { getAssessmentDiscoveryMetadata } from "@/lib/discovery";
import { createStandardReportBlueprint } from "@/lib/reports/blueprints";
import type {
  AssessmentDefinition,
  PreviewSectionDefinition,
  RelatedInsightRecommendation,
  ScoreDimension
} from "@/lib/types/assessment-domain";

const DEFAULT_PRIVACY_NOTE = "Private and confidential";
const DEFAULT_REPORT_LABEL = "Personalized psychological insight report";

const scale = createScaleQuestion;
const choice = createChoiceQuestion;

export type ReportSectionState = "open" | "locked";

export type Assessment = {
  slug: string;
  title: string;
  category: string;
  descriptor: string;
  tagline: string;
  summary: string;
  targetPainPoint: string;
  previewPromise: string;
  questionCount: string;
  timeEstimate: string;
  privacy: string;
  reportLabel: string;
  discoveryCategories: string[];
  problemTags: string[];
  issuePhrases: string[];
  searchKeywords: string[];
  featured: boolean;
  focusPoints: string[];
  outcomes: string[];
  reportSections: Array<{
    title: string;
    description: string;
    state: ReportSectionState;
  }>;
  recommendedSlugs: string[];
  buildStatus: AssessmentDefinition["buildStatus"];
};

function minutesLabel(minutes: number) {
  return `${minutes} minutes`;
}

function dimension(
  key: string,
  label: string,
  shortLabel: string,
  clause: string
): ScoreDimension {
  return {
    key,
    label,
    shortLabel,
    description: clause,
    bandDescriptions: {
      low: `Little evidence suggests ${clause}.`,
      moderate: `Some signs suggest ${clause}.`,
      elevated: `Clear signs suggest ${clause}.`,
      high: `${label} appears to be one of the dominant forces in this pattern.`
    }
  };
}

function related(
  slug: string,
  reason: string,
  recommendationType: RelatedInsightRecommendation["recommendationType"] = "adjacent"
): RelatedInsightRecommendation {
  return {
    slug,
    reason,
    recommendationType
  };
}

function previewSections(
  firstPromise: string,
  secondPromise: string
): PreviewSectionDefinition[] {
  return [
    {
      sectionId: "pattern-summary",
      label: "Pattern Summary",
      promise: firstPromise
    },
    {
      sectionId: "what-responses-suggest",
      label: "What Your Responses Suggest",
      promise: secondPromise
    },
    {
      sectionId: "related-next-insights",
      label: "Related Next Insights",
      promise:
        "See adjacent report paths and bundle-ready next steps before a purchase decision."
    }
  ];
}

const premiumSectionTitles = {
  patternSummary: "Pattern Interpretation",
  whatResponsesSuggest: "Personalized Pattern Interpretation",
  emotionalDrivers: "Emotional Pressure Points",
  dailyLifeImpact: "Response Tendencies",
  blindSpots: "Hidden Friction Areas",
  stabilitySuggestions: "Stability and Clarity Suggestions",
  relatedInsights: "Related Insight Opportunities"
} as const;

function createMetadataOnlyAssessment({
  id,
  slug,
  topicKey,
  title,
  subtitle,
  category,
  estimatedTimeMinutes,
  questionCount,
  targetPainPoint,
  previewPromise,
  focusAreas,
  outcomeHighlights,
  introBullets,
  bundleTags,
  categoryTags,
  dimensions,
  relatedAssessments,
  subscriptionUpsellNote,
  reportTitle,
  reportSubtitle
}: {
  id: string;
  slug: string;
  topicKey: string;
  title: string;
  subtitle: string;
  category: string;
  estimatedTimeMinutes: number;
  questionCount: number;
  targetPainPoint: string;
  previewPromise: string;
  focusAreas: string[];
  outcomeHighlights: string[];
  introBullets: string[];
  bundleTags: string[];
  categoryTags: string[];
  dimensions: ScoreDimension[];
  relatedAssessments: RelatedInsightRecommendation[];
  subscriptionUpsellNote: string;
  reportTitle: string;
  reportSubtitle: string;
}): AssessmentDefinition {
  const plannedSections = attachQuestionIdsToSections(
    [
      {
        id: `${slug}-current-pattern`,
        title: "Current Pattern",
        description: "Planned section for the clearest version of the issue right now.",
        intent: "Capture how the core pattern shows up most immediately."
      },
      {
        id: `${slug}-triggers`,
        title: "Triggers and Conditions",
        description: "Planned section for the contexts that activate or intensify the pattern.",
        intent: "Map what makes the pattern stronger, faster, or harder to dismiss."
      },
      {
        id: `${slug}-behaviors`,
        title: "Behavior and Response Style",
        description: "Planned section for how the user reacts once the pattern is active.",
        intent: "Capture action tendencies, withdrawal, pursuit, or compensation patterns."
      },
      {
        id: `${slug}-impact`,
        title: "Impact and Tension",
        description: "Planned section for the emotional cost and practical spillover.",
        intent: "Measure personal, relational, or day-to-day strain."
      },
      {
        id: `${slug}-stability`,
        title: "Stability and Next Step Readiness",
        description: "Planned section for readiness, resistance, and realistic next-step support.",
        intent: "Set up later report guidance and related-insight recommendations."
      }
    ],
    []
  );

  return {
    id,
    slug,
    topicKey,
    title,
    subtitle,
    category,
    buildStatus: "metadata_ready",
    estimatedTimeMinutes,
    estimatedTimeLabel: minutesLabel(estimatedTimeMinutes),
    questionCount,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint,
    previewPromise,
    reportLabel: DEFAULT_REPORT_LABEL,
    focusAreas,
    outcomeHighlights,
    introBullets,
    bundleTags,
    categoryTags,
    dimensions,
    sections: plannedSections,
    questions: [],
    relatedAssessments,
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: slug,
      title: reportTitle,
      subtitle: reportSubtitle,
      previewPromises: previewSections(
        previewPromise,
        "See the strongest deterministic pattern before any full-report unlock."
      )
    }),
    subscriptionUpsellNote
  };
}

const condescendingDimensions = [
  dimension(
    "status_signaling",
    "Superiority Framing",
    "Status",
    "subtle one-upmanship, rank signaling, or superiority cues are shaping the interaction"
  ),
  dimension(
    "dismissive_delivery",
    "Passive Belittling",
    "Belittling",
    "the delivery style feels diminishing even when the content stays polished or deniable"
  ),
  dimension(
    "self_trust_erosion",
    "Self-Trust Erosion",
    "Self-trust",
    "the interaction leaves you second-guessing your own read of what happened"
  ),
  dimension(
    "boundary_pressure",
    "Boundary Pressure",
    "Boundary",
    "the pattern keeps pressure on you to absorb behavior instead of addressing it directly"
  )
];

const condescendingQuestions = [
  scale({
    id: "cbd-context-1",
    sectionId: "cbd-context",
    prompt:
      "I can usually tell which topics or moments are most likely to bring out a subtly superior tone from this person.",
    scaleKey: "truth",
    dimensionWeights: {
      status_signaling: 1.4,
      boundary_pressure: 0.5
    },
    moderateValueContextMarkers: ["predictable_trigger_pattern"],
    highValueContextMarkers: ["predictable_trigger_pattern", "anticipatory_self_editing"]
  }),
  choice({
    id: "cbd-context-2",
    sectionId: "cbd-context",
    prompt: "When you share something you are proud of, they are most likely to:",
    type: "situational",
    options: [
      {
        id: "warm-curiosity",
        label: "Ask a warm follow-up question and stay with your experience.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "qualified-praise",
        label: "Offer praise, but quickly attach a caveat or correction.",
        value: 2,
        dimensionWeights: {
          dismissive_delivery: 2,
          status_signaling: 1
        },
        contextMarkers: ["qualified_praise"]
      },
      {
        id: "redirect-to-self",
        label: "Redirect the moment toward what they would have done or already know.",
        value: 3,
        dimensionWeights: {
          status_signaling: 3,
          dismissive_delivery: 1
        },
        contextMarkers: ["one_upmanship"]
      },
      {
        id: "point-out-flaw",
        label: "Point out what you missed before acknowledging anything that went well.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 3,
          self_trust_erosion: 2
        },
        contextMarkers: ["premature_correction"]
      }
    ]
  }),
  scale({
    id: "cbd-context-3",
    sectionId: "cbd-context",
    prompt:
      "They often respond as if they already know where I am going before I have fully made my point.",
    scaleKey: "frequency",
    dimensionWeights: {
      dismissive_delivery: 1.3,
      status_signaling: 0.8
    },
    moderateValueContextMarkers: ["premature_override"],
    highValueContextMarkers: ["premature_override", "talked_over"]
  }),
  choice({
    id: "cbd-context-4",
    sectionId: "cbd-context",
    prompt: "The pattern shows up most strongly when:",
    type: "multiple_choice",
    options: [
      {
        id: "public-setting",
        label: "Other people are around and there is an audience.",
        value: 4,
        dimensionWeights: {
          status_signaling: 3,
          dismissive_delivery: 1
        },
        contextMarkers: ["public_status_play"]
      },
      {
        id: "expertise-topic",
        label: "The topic touches their expertise, status, or territory.",
        value: 3,
        dimensionWeights: {
          status_signaling: 3
        },
        contextMarkers: ["territorial_expertise"]
      },
      {
        id: "vulnerable-moment",
        label: "I am uncertain, emotional, or asking for help.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 2,
          boundary_pressure: 2
        },
        contextMarkers: ["vulnerability_exploited"]
      },
      {
        id: "no-clear-pattern",
        label: "It feels inconsistent enough that I still cannot see a clear pattern.",
        value: 1,
        dimensionWeights: {
          self_trust_erosion: 1
        },
        contextMarkers: ["pattern_ambiguity"]
      }
    ]
  }),
  scale({
    id: "cbd-context-5",
    sectionId: "cbd-context",
    prompt:
      "I usually feel clearer and more solid in my own thinking after interacting with this person.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_trust_erosion: 1.4,
      boundary_pressure: 0.4
    },
    reverseScored: true
  }),
  choice({
    id: "cbd-context-6",
    sectionId: "cbd-context",
    prompt: "If I address the tone directly, the response is usually:",
    type: "situational",
    options: [
      {
        id: "genuine-adjustment",
        label: "They take it in and adjust without much defensiveness.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "joke-away",
        label: "They turn it into a joke so nothing actually changes.",
        value: 2,
        dimensionWeights: {
          dismissive_delivery: 1,
          boundary_pressure: 1
        },
        contextMarkers: ["deflects_with_humor"]
      },
      {
        id: "oversensitive",
        label: "They imply that I am taking it too personally.",
        value: 4,
        dimensionWeights: {
          self_trust_erosion: 2,
          boundary_pressure: 3
        },
        contextMarkers: ["oversensitive_reframe"]
      },
      {
        id: "colder-subtle",
        label: "The behavior gets colder or more indirect rather than disappearing.",
        value: 4,
        dimensionWeights: {
          boundary_pressure: 3,
          dismissive_delivery: 2
        },
        contextMarkers: ["retaliatory_coldness"]
      }
    ]
  }),
  scale({
    id: "cbd-tone-1",
    sectionId: "cbd-tone",
    prompt:
      "Corrections from this person often feel more like a positioning move than a genuinely useful clarification.",
    scaleKey: "agreement",
    dimensionWeights: {
      status_signaling: 1.4,
      dismissive_delivery: 0.9
    },
    highValueContextMarkers: ["status_correction"]
  }),
  scale({
    id: "cbd-tone-2",
    sectionId: "cbd-tone",
    prompt: "Small remarks from this person can stay with me long after the exchange is over.",
    scaleKey: "impact",
    dimensionWeights: {
      self_trust_erosion: 1.4,
      dismissive_delivery: 0.6
    },
    moderateValueContextMarkers: ["lingering_aftereffect"],
    highValueContextMarkers: ["lingering_aftereffect", "emotional_shrinkage"]
  }),
  choice({
    id: "cbd-tone-3",
    sectionId: "cbd-tone",
    prompt: "Which feels closer to the truth?",
    type: "forced_choice",
    options: [
      {
        id: "technically-polite",
        label: "They are technically polite, but the interaction still lands as diminishing.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 3,
          self_trust_erosion: 1
        },
        contextMarkers: ["deniable_patronizing"]
      },
      {
        id: "blunt-recoverable",
        label: "They can be blunt, but I still feel fundamentally respected.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "cbd-tone-4",
    sectionId: "cbd-tone",
    prompt:
      "When something genuinely bothers me, they often respond as if my reaction is the real issue rather than what happened.",
    scaleKey: "frequency",
    dimensionWeights: {
      dismissive_delivery: 1.2,
      self_trust_erosion: 0.9
    },
    highValueContextMarkers: ["invalidation_reframe"]
  }),
  scale({
    id: "cbd-tone-5",
    sectionId: "cbd-tone",
    prompt: "Even when they disagree with me, I still feel respected by the end of the exchange.",
    scaleKey: "agreement",
    dimensionWeights: {
      dismissive_delivery: 1.3,
      boundary_pressure: 0.9
    },
    reverseScored: true
  }),
  choice({
    id: "cbd-tone-6",
    sectionId: "cbd-tone",
    prompt: "What tends to land hardest?",
    type: "multiple_choice",
    options: [
      {
        id: "tone",
        label: "The tone itself makes me feel subtly reduced.",
        value: 3,
        dimensionWeights: {
          dismissive_delivery: 3
        },
        contextMarkers: ["tone_carries_the_hit"]
      },
      {
        id: "public-correction",
        label: "Being corrected or undercut in front of other people.",
        value: 4,
        dimensionWeights: {
          status_signaling: 2,
          self_trust_erosion: 2
        },
        contextMarkers: ["public_undercut"]
      },
      {
        id: "implied-incompetence",
        label: "The implication that I need more guidance than I actually do.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 2,
          self_trust_erosion: 2
        },
        contextMarkers: ["implied_incompetence"]
      },
      {
        id: "smiling-dismissal",
        label: "The smiling, deniable version that makes it hard to call out cleanly.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 2,
          boundary_pressure: 2
        },
        contextMarkers: ["smiling_deniability"]
      }
    ]
  }),
  scale({
    id: "cbd-power-1",
    sectionId: "cbd-power",
    prompt:
      "I notice myself editing how I speak so I do not hand this person easy openings to diminish me.",
    scaleKey: "truth",
    dimensionWeights: {
      boundary_pressure: 1.1,
      self_trust_erosion: 1,
      status_signaling: 0.4
    },
    highValueContextMarkers: ["anticipatory_self_editing"]
  }),
  choice({
    id: "cbd-power-2",
    sectionId: "cbd-power",
    prompt: "In group settings, they are most likely to:",
    type: "situational",
    options: [
      {
        id: "give-credit",
        label: "Give credit clearly and build on what I said.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "minor-correction",
        label: "Correct a small detail in a way that changes the room dynamic.",
        value: 3,
        dimensionWeights: {
          status_signaling: 3,
          self_trust_erosion: 1
        },
        contextMarkers: ["public_micro_correction"]
      },
      {
        id: "restate-as-own",
        label: "Restate my point as if it were clearer coming from them.",
        value: 4,
        dimensionWeights: {
          status_signaling: 3,
          dismissive_delivery: 1
        },
        contextMarkers: ["credit_displacement"]
      },
      {
        id: "subtle-questioning",
        label: "Ask questions that make my competence feel slightly in doubt.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 2,
          self_trust_erosion: 2
        },
        contextMarkers: ["competence_doubt"]
      }
    ]
  }),
  scale({
    id: "cbd-power-3",
    sectionId: "cbd-power",
    prompt:
      "The tone gets more patronizing when this person has rank, expertise, age, or an audience on their side.",
    scaleKey: "agreement",
    dimensionWeights: {
      status_signaling: 1.5,
      boundary_pressure: 0.6,
      dismissive_delivery: 0.5
    },
    highValueContextMarkers: ["power_leverage"]
  }),
  choice({
    id: "cbd-power-4",
    sectionId: "cbd-power",
    prompt: "Which is more common?",
    type: "forced_choice",
    options: [
      {
        id: "direct-diminishing",
        label: "The diminishing tone is direct enough that I notice it immediately.",
        value: 3,
        dimensionWeights: {
          dismissive_delivery: 2,
          self_trust_erosion: 1
        }
      },
      {
        id: "indirect-deniable",
        label: "It is subtle enough that I notice it later and still doubt my read.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 2,
          self_trust_erosion: 2,
          boundary_pressure: 1
        },
        contextMarkers: ["delayed_recognition"]
      }
    ]
  }),
  scale({
    id: "cbd-power-5",
    sectionId: "cbd-power",
    prompt:
      "I sometimes wonder whether I am overreacting because the behavior is hard to pin down cleanly.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_trust_erosion: 1.5,
      boundary_pressure: 0.7
    },
    highValueContextMarkers: ["self_doubt_after_contact"]
  }),
  scale({
    id: "cbd-power-6",
    sectionId: "cbd-power",
    prompt:
      "If I set a direct boundary, this person adjusts without making me feel unreasonable.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_pressure: 1.5,
      dismissive_delivery: 0.5
    },
    reverseScored: true
  }),
  scale({
    id: "cbd-after-1",
    sectionId: "cbd-after",
    prompt:
      "After talking with this person, I mentally replay the exchange to work out what just happened.",
    scaleKey: "frequency",
    dimensionWeights: {
      self_trust_erosion: 1.5,
      boundary_pressure: 0.5
    },
    highValueContextMarkers: ["mental_replay"]
  }),
  scale({
    id: "cbd-after-2",
    sectionId: "cbd-after",
    prompt:
      "I often leave interactions with them feeling smaller or less solid in myself than I did going in.",
    scaleKey: "impact",
    dimensionWeights: {
      self_trust_erosion: 1.5,
      dismissive_delivery: 0.7
    },
    highValueContextMarkers: ["emotional_shrinkage"]
  }),
  choice({
    id: "cbd-after-3",
    sectionId: "cbd-after",
    prompt: "My most common reaction afterward is:",
    type: "multiple_choice",
    options: [
      {
        id: "brief-annoyance",
        label: "Brief irritation, then I move on.",
        value: 1,
        dimensionWeights: {
          dismissive_delivery: 1
        }
      },
      {
        id: "self-doubt",
        label: "I start reviewing whether I sounded uninformed, naive, or easy to dismiss.",
        value: 4,
        dimensionWeights: {
          self_trust_erosion: 3
        },
        contextMarkers: ["competence_second_guessing"]
      },
      {
        id: "prove-myself",
        label: "I want to prove myself or tighten up my performance next time.",
        value: 4,
        dimensionWeights: {
          self_trust_erosion: 2,
          boundary_pressure: 1
        },
        contextMarkers: ["prove_myself_reaction"]
      },
      {
        id: "numb-distance",
        label: "I pull back emotionally and keep things guarded.",
        value: 3,
        dimensionWeights: {
          boundary_pressure: 2,
          self_trust_erosion: 1
        },
        contextMarkers: ["guarded_distance"]
      }
    ]
  }),
  scale({
    id: "cbd-after-4",
    sectionId: "cbd-after",
    prompt:
      "I notice myself overexplaining, tightening up, or overperforming just to secure basic respect from this person.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_pressure: 1.1,
      self_trust_erosion: 1.1,
      dismissive_delivery: 0.4
    },
    highValueContextMarkers: ["earned_respect_loop"]
  }),
  choice({
    id: "cbd-after-5",
    sectionId: "cbd-after",
    prompt: "If they praise me, it usually feels:",
    type: "situational",
    options: [
      {
        id: "solid-clean",
        label: "Solid and clean enough that I can trust it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "backhanded",
        label: "Backhanded, like praise with a hidden edge.",
        value: 4,
        dimensionWeights: {
          dismissive_delivery: 3,
          self_trust_erosion: 1
        },
        contextMarkers: ["backhanded_praise"]
      },
      {
        id: "temporary-before-correction",
        label: "Temporary, because a correction or comparison usually follows.",
        value: 4,
        dimensionWeights: {
          status_signaling: 2,
          dismissive_delivery: 2
        },
        contextMarkers: ["praise_then_correction"]
      },
      {
        id: "strategic",
        label: "Strategically timed so I will tolerate the next comment.",
        value: 4,
        dimensionWeights: {
          boundary_pressure: 3,
          dismissive_delivery: 1
        },
        contextMarkers: ["intermittent_validation"]
      }
    ]
  }),
  scale({
    id: "cbd-after-6",
    sectionId: "cbd-after",
    prompt:
      "Around this person I can stay grounded in my own read of events without needing their approval.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_trust_erosion: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "cbd-boundary-1",
    sectionId: "cbd-boundary",
    prompt:
      "I find myself bracing for this dynamic before the interaction has even really begun.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_pressure: 1.2,
      status_signaling: 0.6
    },
    highValueContextMarkers: ["chronic_pattern"]
  }),
  choice({
    id: "cbd-boundary-2",
    sectionId: "cbd-boundary",
    prompt:
      "When I imagine taking more distance or being more direct, the main reason I hesitate is:",
    type: "multiple_choice",
    options: [
      {
        id: "not-severe-enough",
        label: "I still wonder whether the pattern is real enough to justify being firm about it.",
        value: 4,
        dimensionWeights: {
          self_trust_erosion: 2,
          boundary_pressure: 2
        },
        contextMarkers: ["permission_to_leave_is_weak"]
      },
      {
        id: "practical-cost",
        label: "The work, family, or relational cost feels hard to manage.",
        value: 3,
        dimensionWeights: {
          boundary_pressure: 3
        },
        contextMarkers: ["practical_barrier"]
      },
      {
        id: "hope-improves",
        label: "Part of me still expects the dynamic to improve on its own.",
        value: 2,
        dimensionWeights: {
          boundary_pressure: 2
        }
      },
      {
        id: "not-hesitating",
        label: "I do not actually feel much hesitation about addressing it.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "cbd-boundary-3",
    sectionId: "cbd-boundary",
    prompt:
      "This relationship seems to work partly because I absorb behavior I would push back on more quickly elsewhere.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_pressure: 1.6,
      dismissive_delivery: 0.5,
      self_trust_erosion: 0.7
    },
    highValueContextMarkers: ["adapted_to_disrespect"]
  }),
  choice({
    id: "cbd-boundary-4",
    sectionId: "cbd-boundary",
    prompt: "If I addressed the issue clearly, I expect they would:",
    type: "situational",
    options: [
      {
        id: "engage-respectfully",
        label: "Engage respectfully and try to understand the impact.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "deny",
        label: "Deny the pattern and act as if nothing meaningful happened.",
        value: 3,
        dimensionWeights: {
          boundary_pressure: 2,
          self_trust_erosion: 1
        },
        contextMarkers: ["denial_response"]
      },
      {
        id: "oversensitive",
        label: "Frame me as too sensitive, too serious, or misreading the interaction.",
        value: 4,
        dimensionWeights: {
          boundary_pressure: 3,
          self_trust_erosion: 1
        },
        contextMarkers: ["oversensitive_reframe"]
      },
      {
        id: "colder",
        label: "Become colder, but in a way that stays hard to confront cleanly.",
        value: 4,
        dimensionWeights: {
          boundary_pressure: 3,
          dismissive_delivery: 1
        },
        contextMarkers: ["covert_retaliation"]
      }
    ]
  }),
  scale({
    id: "cbd-boundary-5",
    sectionId: "cbd-boundary",
    prompt:
      "The pattern makes me question my judgment almost as much as it hurts my feelings.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_trust_erosion: 1.4,
      boundary_pressure: 0.8
    },
    highValueContextMarkers: ["self_trust_hit"]
  }),
  scale({
    id: "cbd-boundary-6",
    sectionId: "cbd-boundary",
    prompt:
      "I feel free to disagree with this person without bracing for a subtle put-down.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_pressure: 1.4,
      dismissive_delivery: 0.8
    },
    reverseScored: true
  })
];

const condescendingAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "cbd-context",
        title: "Recognition and Trigger Pattern",
        description: "Where the dynamic tends to show up and how predictable it has become.",
        intent: "Separate isolated awkwardness from a repeatable interpersonal pattern."
      },
      {
        id: "cbd-tone",
        title: "Tone and Undercut",
        description: "How the behavior lands in real exchanges, even when it stays polished or deniable.",
        intent: "Capture the feel of the delivery rather than only the literal words."
      },
      {
        id: "cbd-power",
        title: "Power and Deniability",
        description: "How status, audience, or leverage change the dynamic.",
        intent: "Measure whether the pattern is tied to hierarchy, deniability, or control."
      },
      {
        id: "cbd-after",
        title: "Internal Aftereffects",
        description: "What lingers after the interaction has technically ended.",
        intent: "Assess emotional residue, replaying, and shifts in self-trust."
      },
      {
        id: "cbd-boundary",
        title: "Boundary Strain",
        description: "How hard it feels to name, challenge, or step back from the pattern.",
        intent: "Measure chronicity, hesitation, and how much permission you feel to respond differently."
      }
    ],
    condescendingQuestions
  );

  return {
    id: "asm_condescending_behavior_decoder",
    slug: "condescending-behavior-decoder",
    topicKey: "condescension",
    title: "Condescending Behavior Decoder",
    subtitle:
      "Clarify whether someone's tone is merely awkward, quietly superior, or steadily diminishing your footing.",
    category: "Relationship Dynamics",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 5,
    estimatedTimeLabel: minutesLabel(5),
    questionCount: condescendingQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You leave certain interactions feeling subtly reduced or talked down to, but the behavior stays polished enough that you still question your own interpretation.",
    previewPromise:
      "See whether the pattern reads as social awkwardness, deniable status signaling, or a dynamic already affecting your self-trust.",
    reportLabel: "Relational dynamics insight report",
    focusAreas: [
      "Superiority and status signaling",
      "Deniable tone and correction patterns",
      "Self-trust impact and boundary strain"
    ],
    outcomeHighlights: [
      "Clarify whether the behavior looks socially clumsy, quietly superior, or consistently diminishing.",
      "Separate momentary discomfort from the deeper effect on confidence, clarity, and self-trust.",
      "Show where boundary strain and red-flag context may already be entering the picture."
    ],
    introBullets: [
      "Built for interactions that feel belittling, but still hard to name cleanly because the behavior stays polished, indirect, or easy to dismiss in hindsight.",
      "Looks closely at tone, timing, hierarchy, correction style, emotional aftereffects, and how much the dynamic changes your footing in the moment.",
      "The resulting report is designed to help you decide whether the pattern is irritating, quietly diminishing, or serious enough to treat as a relational warning sign."
    ],
    bundleTags: ["relationship-clarity", "boundary-signals"],
    categoryTags: ["relationships", "communication", "red-flags"],
    dimensions: condescendingDimensions,
    sections,
    questions: condescendingQuestions,
    relatedAssessments: [
      related(
        "toxic-pattern-and-red-flag-report",
        "Useful if the dynamic may be less subtle than it first appears and you want to compare it against a stronger red-flag framework.",
        "deepen"
      ),
      related(
        "attachment-and-relationship-style-report",
        "Useful if the dynamic keeps pulling you into appeasing, overexplaining, reassurance-seeking, or protest patterns."
      ),
      related(
        "membership",
        "Membership can later store your relationship-pattern reports and help you compare adjacent dynamics over time.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "condescending-behavior-decoder",
      title: "Condescending Dynamic Insight Report",
      subtitle:
        "A premium report for subtle superiority, deniable disrespect, self-trust erosion, and boundary strain.",
      previewPromises: previewSections(
        "Get a fast read on whether the pattern is mainly awkward, status-weighted, or quietly diminishing.",
        "Preview how tone, deniability, and internal aftereffects appear to be clustering."
      ),
      sectionTitles: {
        patternSummary: "Pattern Interpretation",
        whatResponsesSuggest: "Personalized Pattern Interpretation",
        emotionalDrivers: "Emotional Pressure Points",
        dailyLifeImpact: "Response Tendencies",
        blindSpots: "Hidden Friction Areas",
        stabilitySuggestions: "Stability and Clarity Suggestions",
        relatedInsights: "Related Insight Opportunities"
      },
      sectionDescriptions: {
        patternSummary:
          "An early read on whether the behavior looks awkward, status-weighted, or quietly diminishing.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how tone, hierarchy, and internal aftereffects appear to be combining.",
        emotionalDrivers:
          "Premium section on superiority cues, control pressure, sensitivity to status, and the emotional mechanics under the dynamic.",
        dailyLifeImpact:
          "Premium section showing how the pattern changes your voice, confidence, interpretation, and response style in real life.",
        blindSpots:
          "Premium section for deniability traps, self-doubt loops, and the friction that stays hard to name cleanly.",
        stabilitySuggestions:
          "Premium section for steadier boundary thinking, clearer interpretation, and more grounded response options.",
        relatedInsights:
          "Related relationship reports and bundle paths that make sense after this result."
      }
    }),
    subscriptionUpsellNote:
      "Best paired with membership when the user wants ongoing access to relationship-pattern reports, adjacent comparisons, and future relational follow-up insights."
  } satisfies AssessmentDefinition;
})();

const imposterDimensions = [
  dimension(
    "achievement_discounting",
    "Competence Discounting",
    "Discounting",
    "clear evidence of competence is still being minimized or explained away"
  ),
  dimension(
    "exposure_fear",
    "Exposure Sensitivity",
    "Exposure",
    "visibility and responsibility quickly turn into fear of being found lacking"
  ),
  dimension(
    "praise_resistance",
    "Praise Resistance",
    "Praise",
    "positive feedback is hard to absorb, trust, or keep"
  ),
  dimension(
    "comparison_pressure",
    "Comparison Sensitivity",
    "Comparison",
    "self-evaluation is being distorted by how capable or effortless other people seem"
  ),
  dimension(
    "overpreparation_loop",
    "Overpreparation Pattern",
    "Overprepare",
    "extra work and vigilance are being used to quiet private doubt"
  )
];

const imposterQuestions = [
  scale({
    id: "imp-achieve-1",
    sectionId: "imp-achieve",
    prompt:
      "When something goes well, my mind usually goes to effort, timing, or luck before it lets ability count.",
    scaleKey: "agreement",
    dimensionWeights: {
      achievement_discounting: 1.6
    },
    highValueContextMarkers: ["success_discounted"]
  }),
  choice({
    id: "imp-achieve-2",
    sectionId: "imp-achieve",
    prompt: "After a strong outcome, the thought that feels most immediate is:",
    type: "multiple_choice",
    options: [
      {
        id: "i-earned-it",
        label: "I handled that well and can let it count.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "anyone-could",
        label: "Anyone in my position probably could have done the same.",
        value: 3,
        dimensionWeights: {
          achievement_discounting: 3
        },
        contextMarkers: ["achievement_minimized"]
      },
      {
        id: "they-missed-flaws",
        label: "They probably did not notice the weak parts the way I did.",
        value: 4,
        dimensionWeights: {
          exposure_fear: 2,
          praise_resistance: 1
        },
        contextMarkers: ["hidden_flaws_focus"]
      },
      {
        id: "must-keep-proving",
        label: "Now I have to keep proving it so they do not revise their opinion of me.",
        value: 4,
        dimensionWeights: {
          overpreparation_loop: 2,
          exposure_fear: 2
        },
        contextMarkers: ["must_keep_proving"]
      }
    ]
  }),
  scale({
    id: "imp-achieve-3",
    sectionId: "imp-achieve",
    prompt:
      "I can let a strong performance stand without immediately moving the standard higher.",
    scaleKey: "agreement",
    dimensionWeights: {
      achievement_discounting: 1.3,
      comparison_pressure: 0.7
    },
    reverseScored: true
  }),
  scale({
    id: "imp-achieve-4",
    sectionId: "imp-achieve",
    prompt:
      "Even after repeated evidence, competence still feels less believable from the inside than it looks from the outside.",
    scaleKey: "truth",
    dimensionWeights: {
      achievement_discounting: 1.5,
      praise_resistance: 0.8
    },
    highValueContextMarkers: ["inside_outside_gap"]
  }),
  choice({
    id: "imp-achieve-5",
    sectionId: "imp-achieve",
    prompt: "When I think about why I have done well so far, the answer feels closest to:",
    type: "forced_choice",
    options: [
      {
        id: "earned-capability",
        label: "I am imperfect, but my ability is part of the reason.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "holding-it-together",
        label: "I have been holding things together through vigilance more than real confidence.",
        value: 4,
        dimensionWeights: {
          achievement_discounting: 2,
          overpreparation_loop: 2
        },
        contextMarkers: ["held_together_by_vigilance"]
      }
    ]
  }),
  scale({
    id: "imp-achieve-6",
    sectionId: "imp-achieve",
    prompt:
      "Past evidence rarely settles the question of whether I am actually as capable as people think.",
    scaleKey: "agreement",
    dimensionWeights: {
      achievement_discounting: 1.4,
      exposure_fear: 0.7
    }
  }),
  scale({
    id: "imp-exposure-1",
    sectionId: "imp-exposure",
    prompt:
      "As soon as other people rely on me more visibly, my self-doubt rises faster than the actual demands do.",
    scaleKey: "agreement",
    dimensionWeights: {
      exposure_fear: 1.6
    },
    highValueContextMarkers: ["visibility_spike"]
  }),
  choice({
    id: "imp-exposure-2",
    sectionId: "imp-exposure",
    prompt: "If someone says, \"You clearly know what you are doing,\" my reaction is most likely to be:",
    type: "situational",
    options: [
      {
        id: "take-it-in",
        label: "I can take it in without much internal argument.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "temporary-relief",
        label: "Brief relief, followed by pressure not to disappoint them.",
        value: 3,
        dimensionWeights: {
          exposure_fear: 2,
          praise_resistance: 1
        },
        contextMarkers: ["praise_turns_into_pressure"]
      },
      {
        id: "they-do-not-see",
        label: "A quiet thought that they do not see the parts I am still faking.",
        value: 4,
        dimensionWeights: {
          exposure_fear: 3,
          praise_resistance: 1
        },
        contextMarkers: ["fear_of_being_seen_fully"]
      },
      {
        id: "must-work-harder",
        label: "An urge to prepare even more so I can justify what they think of me.",
        value: 4,
        dimensionWeights: {
          exposure_fear: 2,
          overpreparation_loop: 2
        },
        contextMarkers: ["validation_triggers_overwork"]
      }
    ]
  }),
  scale({
    id: "imp-exposure-3",
    sectionId: "imp-exposure",
    prompt:
      "Being trusted can raise my internal pressure faster than being questioned does.",
    scaleKey: "agreement",
    dimensionWeights: {
      exposure_fear: 1.5,
      overpreparation_loop: 0.6
    }
  }),
  choice({
    id: "imp-exposure-4",
    sectionId: "imp-exposure",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "not-enough-yet",
        label: "I mostly worry that I do not know enough yet.",
        value: 2,
        dimensionWeights: {
          overpreparation_loop: 1,
          exposure_fear: 1
        }
      },
      {
        id: "others-overestimate",
        label: "I mostly worry that other people are overestimating what I can actually sustain.",
        value: 4,
        dimensionWeights: {
          exposure_fear: 3,
          achievement_discounting: 1
        },
        contextMarkers: ["others_overestimate_me"]
      }
    ]
  }),
  scale({
    id: "imp-exposure-5",
    sectionId: "imp-exposure",
    prompt:
      "Being asked to speak confidently before I feel fully ready creates more strain than it seems to for other people.",
    scaleKey: "truth",
    dimensionWeights: {
      exposure_fear: 1.4,
      overpreparation_loop: 0.8
    },
    highValueContextMarkers: ["readiness_threshold_too_high"]
  }),
  scale({
    id: "imp-exposure-6",
    sectionId: "imp-exposure",
    prompt:
      "I can remain fairly steady even when I am visible, under review, or being counted on heavily.",
    scaleKey: "agreement",
    dimensionWeights: {
      exposure_fear: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "imp-praise-1",
    sectionId: "imp-praise",
    prompt:
      "Praise tends to fade inside me faster than criticism does.",
    scaleKey: "agreement",
    dimensionWeights: {
      praise_resistance: 1.6
    },
    highValueContextMarkers: ["praise_does_not_land"]
  }),
  choice({
    id: "imp-praise-2",
    sectionId: "imp-praise",
    prompt: "When someone compliments your work, your first move is most likely to:",
    type: "situational",
    options: [
      {
        id: "say-thanks",
        label: "Say thank you and let it stand.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "qualify",
        label: "Immediately qualify it with what could have been better.",
        value: 4,
        dimensionWeights: {
          praise_resistance: 3,
          achievement_discounting: 1
        },
        contextMarkers: ["automatic_qualification"]
      },
      {
        id: "redirect-team",
        label: "Redirect credit away from yourself before you can absorb it.",
        value: 3,
        dimensionWeights: {
          praise_resistance: 2,
          achievement_discounting: 1
        }
      },
      {
        id: "scan-for-cost",
        label: "Wonder what expectation has just increased because they said that.",
        value: 4,
        dimensionWeights: {
          praise_resistance: 2,
          exposure_fear: 2
        },
        contextMarkers: ["compliment_as_risk"]
      }
    ]
  }),
  scale({
    id: "imp-praise-3",
    sectionId: "imp-praise",
    prompt:
      "Positive feedback feels less trustworthy to me than my own private doubts do.",
    scaleKey: "agreement",
    dimensionWeights: {
      praise_resistance: 1.5,
      exposure_fear: 0.7
    }
  }),
  scale({
    id: "imp-praise-4",
    sectionId: "imp-praise",
    prompt:
      "I can hold onto encouraging feedback for longer than a few moments before my mind argues with it.",
    scaleKey: "agreement",
    dimensionWeights: {
      praise_resistance: 1.4
    },
    reverseScored: true
  }),
  choice({
    id: "imp-praise-5",
    sectionId: "imp-praise",
    prompt: "Which lands closer to the truth?",
    type: "forced_choice",
    options: [
      {
        id: "feedback-helps",
        label: "Encouragement generally helps me settle and trust my footing.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "feedback-raises-stakes",
        label: "Encouragement often raises the stakes more than it steadies me.",
        value: 4,
        dimensionWeights: {
          praise_resistance: 2,
          exposure_fear: 2
        },
        contextMarkers: ["encouragement_raises_stakes"]
      }
    ]
  }),
  scale({
    id: "imp-praise-6",
    sectionId: "imp-praise",
    prompt:
      "After positive feedback, I often wait for the correction, catch, or higher expectation that might follow.",
    scaleKey: "agreement",
    dimensionWeights: {
      praise_resistance: 1.1,
      exposure_fear: 0.9
    },
    highValueContextMarkers: ["waiting_for_the_catch"]
  }),
  scale({
    id: "imp-compare-1",
    sectionId: "imp-compare",
    prompt:
      "Other people's apparent ease or certainty can make my own competence feel less convincing within seconds.",
    scaleKey: "agreement",
    dimensionWeights: {
      comparison_pressure: 1.6
    },
    highValueContextMarkers: ["external_ease_is_triggering"]
  }),
  choice({
    id: "imp-compare-2",
    sectionId: "imp-compare",
    prompt: "When you notice someone doing well, you are most likely to think:",
    type: "multiple_choice",
    options: [
      {
        id: "both-can-be-true",
        label: "They are doing well, and that does not have to reduce my footing.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "they-are-real",
        label: "They seem naturally solid in a way I still do not feel.",
        value: 4,
        dimensionWeights: {
          comparison_pressure: 3,
          achievement_discounting: 1
        },
        contextMarkers: ["others_feel_more_real"]
      },
      {
        id: "i-must-close-gap",
        label: "I should be doing more if I want to deserve my position.",
        value: 4,
        dimensionWeights: {
          comparison_pressure: 2,
          overpreparation_loop: 2
        },
        contextMarkers: ["comparison_to_overwork"]
      },
      {
        id: "they-are-ahead",
        label: "They are ahead of me in a way I may never catch up to.",
        value: 4,
        dimensionWeights: {
          comparison_pressure: 3
        },
        contextMarkers: ["permanent_gap_story"]
      }
    ]
  }),
  scale({
    id: "imp-compare-3",
    sectionId: "imp-compare",
    prompt:
      "I become harsher with myself around people who seem calm, polished, or naturally articulate.",
    scaleKey: "agreement",
    dimensionWeights: {
      comparison_pressure: 1.5,
      exposure_fear: 0.5
    }
  }),
  scale({
    id: "imp-compare-4",
    sectionId: "imp-compare",
    prompt:
      "I can see someone else’s strength without automatically turning it into evidence against myself.",
    scaleKey: "agreement",
    dimensionWeights: {
      comparison_pressure: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "imp-compare-5",
    sectionId: "imp-compare",
    prompt: "The comparison that hits hardest is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "confidence",
        label: "How naturally confident or sure other people seem.",
        value: 4,
        dimensionWeights: {
          comparison_pressure: 3
        },
        contextMarkers: ["confidence_comparison"]
      },
      {
        id: "speed",
        label: "How quickly they seem to understand and respond.",
        value: 3,
        dimensionWeights: {
          comparison_pressure: 2,
          exposure_fear: 1
        }
      },
      {
        id: "recognition",
        label: "How easily they seem to accept recognition or authority.",
        value: 4,
        dimensionWeights: {
          comparison_pressure: 2,
          praise_resistance: 2
        }
      },
      {
        id: "not-comparison",
        label: "Comparison is not usually the main issue for me.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "imp-compare-6",
    sectionId: "imp-compare",
    prompt:
      "I can end up treating other people's visible strengths as more trustworthy than my own repeated evidence.",
    scaleKey: "agreement",
    dimensionWeights: {
      comparison_pressure: 1.3,
      achievement_discounting: 0.8
    }
  }),
  scale({
    id: "imp-comp-1",
    sectionId: "imp-comp",
    prompt:
      "I rely on extra preparation to feel safe enough, not just prepared enough.",
    scaleKey: "truth",
    dimensionWeights: {
      overpreparation_loop: 1.6
    },
    highValueContextMarkers: ["preparation_as_safety"]
  }),
  choice({
    id: "imp-comp-2",
    sectionId: "imp-comp",
    prompt: "When something important is due, your default pattern is closest to:",
    type: "situational",
    options: [
      {
        id: "steady-prep",
        label: "Prepare steadily and stop when the work is genuinely in good shape.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "keep-checking",
        label: "Keep checking because certainty never arrives as fast as I want it to.",
        value: 4,
        dimensionWeights: {
          overpreparation_loop: 3,
          exposure_fear: 1
        },
        contextMarkers: ["certainty_never_arrives"]
      },
      {
        id: "avoid-then-surge",
        label: "Avoid for a while, then overcompensate with a late surge.",
        value: 3,
        dimensionWeights: {
          overpreparation_loop: 2,
          exposure_fear: 1
        }
      },
      {
        id: "ask-more-than-needed",
        label: "Ask for extra reassurance or extra data before feeling okay to proceed.",
        value: 4,
        dimensionWeights: {
          overpreparation_loop: 2,
          praise_resistance: 1,
          exposure_fear: 1
        },
        contextMarkers: ["reassurance_before_action"]
      }
    ]
  }),
  scale({
    id: "imp-comp-3",
    sectionId: "imp-comp",
    prompt:
      "Rest can feel undeserved when I am still privately unconvinced by my own performance.",
    scaleKey: "agreement",
    dimensionWeights: {
      overpreparation_loop: 1.3,
      achievement_discounting: 0.7
    }
  }),
  scale({
    id: "imp-comp-4",
    sectionId: "imp-comp",
    prompt:
      "A lot of my extra effort is about preventing embarrassment or exposure, not just improving the work.",
    scaleKey: "agreement",
    dimensionWeights: {
      overpreparation_loop: 1.3,
      exposure_fear: 0.9
    }
  }),
  scale({
    id: "imp-comp-5",
    sectionId: "imp-comp",
    prompt:
      "I can stop preparing once the work is strong, even if I still feel a little uneasy.",
    scaleKey: "agreement",
    dimensionWeights: {
      overpreparation_loop: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "imp-comp-6",
    sectionId: "imp-comp",
    prompt: "The private rule that feels closest to mine is:",
    type: "forced_choice",
    options: [
      {
        id: "good-enough-is-real",
        label: "Good enough can still be real, competent work.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "more-work-keeps-me-safe",
        label: "If I do more than most people would, I am less likely to be exposed.",
        value: 4,
        dimensionWeights: {
          overpreparation_loop: 3,
          exposure_fear: 1
        },
        contextMarkers: ["more_work_equals_safety"]
      }
    ]
  })
];

const imposterAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "imp-achieve",
        title: "Evidence and Self-Trust",
        description: "How hard it is to let real evidence of capability count.",
        intent: "Measure discounting, minimization, and the inside-outside gap around success."
      },
      {
        id: "imp-exposure",
        title: "Visibility and Exposure",
        description: "What happens when visibility, trust, or responsibility increases.",
        intent: "Capture the pressure of being seen as less capable than other people assume."
      },
      {
        id: "imp-praise",
        title: "Praise and Legitimacy",
        description: "How feedback lands and whether recognition steadies or destabilizes you.",
        intent: "Measure difficulty absorbing praise without converting it into pressure or doubt."
      },
      {
        id: "imp-compare",
        title: "Comparison Pressure",
        description: "How other people's apparent ease reshapes self-evaluation.",
        intent: "Track comparison-driven distortion and self-measurement drift."
      },
      {
        id: "imp-comp",
        title: "Overpreparation and Recovery",
        description: "How work, overpreparation, and rest are affected by private doubt.",
        intent: "Measure how much overfunctioning has become emotional protection."
      }
    ],
    imposterQuestions
  );

  return {
    id: "asm_imposter_syndrome_deep_report",
    slug: "imposter-syndrome-deep-report",
    topicKey: "imposter_syndrome",
    title: "Imposter Syndrome Deep Report",
    subtitle:
      "A deeper read on competence doubt, praise resistance, and the pressure to keep proving yourself.",
    category: "Self-Perception",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: imposterQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You can meet expectations on the outside while still feeling privately unconvinced, exposed, or strangely unable to let your competence count.",
    previewPromise:
      "See whether the loop is being driven most by discounting, exposure sensitivity, praise resistance, comparison pressure, or overpreparation.",
    reportLabel: "Competence-pattern insight report",
    focusAreas: [
      "Competence discounting",
      "Visibility and praise pressure",
      "Comparison and overpreparation loops"
    ],
    outcomeHighlights: [
      "Separate ordinary self-doubt from the more specific mechanics of imposter pressure.",
      "Show whether visibility, praise, comparison, or internal standards are creating the strongest instability.",
      "Surface whether overpreparation has become emotional protection rather than healthy diligence."
    ],
    introBullets: [
      "Built for high-functioning users whose outer performance and inner certainty do not match.",
      "Questions focus on what success, visibility, praise, comparison, and effort feel like from the inside rather than how they look from the outside.",
      "The resulting report is designed to clarify where the pressure comes from, what keeps it active, and why reassurance alone may not solve it."
    ],
    bundleTags: ["self-perception", "performance-pressure"],
    categoryTags: ["career", "identity", "self-worth"],
    dimensions: imposterDimensions,
    sections,
    questions: imposterQuestions,
    relatedAssessments: [
      related(
        "identity-and-inner-conflict-profile",
        "Useful if the confidence strain feels tied to role confusion, authenticity pressure, or a shaky sense of self."
      ),
      related(
        "personality-burnout-and-stress-report",
        "Useful if the coping strategy is already sliding toward chronic overfunctioning, stress, and exhaustion.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later combine stored reports with ongoing self-pattern tracking and follow-up insight paths.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "imposter-syndrome-deep-report",
      title: "Imposter Pattern Deep Report",
      subtitle:
        "A premium report for competence discounting, exposure sensitivity, comparison strain, and overpreparation loops.",
      previewPromises: previewSections(
        "See whether discounting, exposure pressure, comparison, or overpreparation is driving the loop.",
        "Preview how praise, visibility, and work-related pressure appear to be connecting in your result."
      ),
      sectionTitles: {
        patternSummary: "Pattern Interpretation",
        whatResponsesSuggest: "Personalized Pattern Interpretation",
        emotionalDrivers: "Emotional Pressure Points",
        dailyLifeImpact: "Performance Response Tendencies",
        blindSpots: "Hidden Friction Areas",
        stabilitySuggestions: "Stability and Clarity Suggestions",
        relatedInsights: "Related Insight Opportunities"
      },
      sectionDescriptions: {
        patternSummary:
          "An early read on which part of the imposter loop is carrying the most weight right now.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how discounting, praise resistance, exposure pressure, and comparison appear to be working together.",
        emotionalDrivers:
          "Premium section on internal pressure, legitimacy strain, and the emotional mechanics under the loop.",
        dailyLifeImpact:
          "Premium section translating the pattern into work, visibility, rest, and performance behavior.",
        blindSpots:
          "Premium section surfacing hidden rules, self-protective habits, and the internal logic keeping the loop active.",
        stabilitySuggestions:
          "Premium section for steadier next steps that reduce pressure without asking for even more performance.",
        relatedInsights:
          "Related reports and bundle paths that make sense after this confidence-pattern result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate when users want ongoing self-pattern tracking, follow-up interpretation, and burnout or identity crossover insights."
  } satisfies AssessmentDefinition;
})();

const infatuationDimensions = [
  dimension(
    "intrusive_focus",
    "Emotional Preoccupation",
    "Focus",
    "mental attention keeps returning to the person even when relief would be useful"
  ),
  dimension(
    "uncertainty_reinforcement",
    "Mixed-Signal Sensitivity",
    "Uncertainty",
    "mixed signals and ambiguity are intensifying attachment instead of settling it"
  ),
  dimension(
    "fantasy_projection",
    "Projected Meaning",
    "Meaning",
    "imagination is carrying more certainty or meaning than the relationship itself provides"
  ),
  dimension(
    "self_abandonment",
    "Self-Abandonment",
    "Self-shift",
    "your routines, focus, and self-respect are shifting around the attachment"
  ),
  dimension(
    "release_resistance",
    "Difficulty Releasing",
    "Release",
    "the attachment remains hard to soften even when part of you wants distance"
  )
];

const infatuationQuestions = [
  scale({
    id: "ria-occupancy-1",
    sectionId: "ria-occupancy",
    prompt:
      "My mind returns to this person quickly, even when I am trying to stay with something else.",
    scaleKey: "frequency",
    dimensionWeights: {
      intrusive_focus: 1.6
    },
    highValueContextMarkers: ["mental_reentry"]
  }),
  choice({
    id: "ria-occupancy-2",
    sectionId: "ria-occupancy",
    prompt: "When my mind comes back to them, it is usually because:",
    type: "multiple_choice",
    options: [
      {
        id: "recently-connected",
        label: "Something real just happened and I am still processing it.",
        value: 1,
        dimensionWeights: {
          intrusive_focus: 1
        }
      },
      {
        id: "looking-for-signal",
        label: "I am scanning for signs of what they feel or where things stand.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 2,
          uncertainty_reinforcement: 2
        },
        contextMarkers: ["signal_scanning"]
      },
      {
        id: "imagining-version",
        label: "I drift into imagined moments, explanations, or future versions of us.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 3,
          intrusive_focus: 1
        },
        contextMarkers: ["imagined_future"]
      },
      {
        id: "self-comparison",
        label: "I start comparing how much they seem to matter to me versus how much I matter to them.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          self_abandonment: 1
        },
        contextMarkers: ["asymmetry_monitoring"]
      }
    ]
  }),
  scale({
    id: "ria-occupancy-3",
    sectionId: "ria-occupancy",
    prompt:
      "The attachment can crowd out work, conversations, or routines that would usually keep me grounded.",
    scaleKey: "impact",
    dimensionWeights: {
      intrusive_focus: 1.2,
      self_abandonment: 1
    },
    highValueContextMarkers: ["attention_crowding"]
  }),
  scale({
    id: "ria-occupancy-4",
    sectionId: "ria-occupancy",
    prompt:
      "I can choose not to think about this person for meaningful stretches without much internal pull.",
    scaleKey: "agreement",
    dimensionWeights: {
      intrusive_focus: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "ria-occupancy-5",
    sectionId: "ria-occupancy",
    prompt: "If a message or sign from them appears, the emotional shift is usually:",
    type: "situational",
    options: [
      {
        id: "steady",
        label: "Noticeable, but still fairly steady.",
        value: 1,
        dimensionWeights: {
          intrusive_focus: 1
        }
      },
      {
        id: "strong-lift",
        label: "A strong lift or relief that changes the tone of my day.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 2,
          self_abandonment: 1
        },
        contextMarkers: ["message_relief_spike"]
      },
      {
        id: "story-building",
        label: "A fast urge to interpret what it means for the larger situation.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          fantasy_projection: 2
        },
        contextMarkers: ["small_signal_large_story"]
      },
      {
        id: "need-more",
        label: "A brief high, followed by wanting more contact or clarity right away.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 2,
          uncertainty_reinforcement: 2
        },
        contextMarkers: ["contact_creates_more_hunger"]
      }
    ]
  }),
  scale({
    id: "ria-occupancy-6",
    sectionId: "ria-occupancy",
    prompt:
      "The intensity in my mind often feels larger than the relationship evidence would seem to justify.",
    scaleKey: "agreement",
    dimensionWeights: {
      intrusive_focus: 1.1,
      fantasy_projection: 1.1
    }
  }),
  scale({
    id: "ria-uncertainty-1",
    sectionId: "ria-uncertainty",
    prompt:
      "Ambiguity from this person tends to intensify the attachment more than real clarity would.",
    scaleKey: "agreement",
    dimensionWeights: {
      uncertainty_reinforcement: 1.7
    },
    highValueContextMarkers: ["ambiguity_intensifies"]
  }),
  choice({
    id: "ria-uncertainty-2",
    sectionId: "ria-uncertainty",
    prompt: "The part that hooks me fastest is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "warmth",
        label: "Real warmth and genuine consistency.",
        value: 1,
        dimensionWeights: {
          intrusive_focus: 1
        }
      },
      {
        id: "mixed-signals",
        label: "Mixed signals that feel hard to decode cleanly.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 3
        },
        contextMarkers: ["mixed_signal_hook"]
      },
      {
        id: "rare-moments",
        label: "Rare moments that feel unusually intense or meaningful.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          fantasy_projection: 1
        },
        contextMarkers: ["rare_high_value_moment"]
      },
      {
        id: "distance",
        label: "Distance or silence that makes me search for meaning.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          release_resistance: 1
        },
        contextMarkers: ["silence_as_trigger"]
      }
    ]
  }),
  scale({
    id: "ria-uncertainty-3",
    sectionId: "ria-uncertainty",
    prompt:
      "Not knowing where I stand with this person can feel more emotionally activating than a clear answer I may not like.",
    scaleKey: "agreement",
    dimensionWeights: {
      uncertainty_reinforcement: 1.5,
      release_resistance: 0.7
    }
  }),
  choice({
    id: "ria-uncertainty-4",
    sectionId: "ria-uncertainty",
    prompt: "If they suddenly became fully clear and unavailable, I imagine I would mostly:",
    type: "situational",
    options: [
      {
        id: "hurt-but-clear",
        label: "Feel hurt, but also more able to move forward.",
        value: 1,
        dimensionWeights: {
          release_resistance: 1
        }
      },
      {
        id: "search-for-loophole",
        label: "Search for exceptions, subtext, or reasons the door is not fully closed.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          release_resistance: 2
        },
        contextMarkers: ["loophole_searching"]
      },
      {
        id: "replay-more",
        label: "Replay the history even more intensely to make sense of it.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 1,
          release_resistance: 2,
          fantasy_projection: 1
        },
        contextMarkers: ["closure_replay"]
      },
      {
        id: "feel-relief-and-loss",
        label: "Feel both loss and relief because ambiguity has been part of the problem.",
        value: 2,
        dimensionWeights: {
          uncertainty_reinforcement: 1
        }
      }
    ]
  }),
  scale({
    id: "ria-uncertainty-5",
    sectionId: "ria-uncertainty",
    prompt:
      "My mind can turn brief interactions into larger evidence than they probably deserve.",
    scaleKey: "agreement",
    dimensionWeights: {
      uncertainty_reinforcement: 1.2,
      fantasy_projection: 1
    },
    highValueContextMarkers: ["micro_signal_expansion"]
  }),
  scale({
    id: "ria-uncertainty-6",
    sectionId: "ria-uncertainty",
    prompt:
      "I can tolerate uncertainty here without getting more emotionally invested in solving it.",
    scaleKey: "agreement",
    dimensionWeights: {
      uncertainty_reinforcement: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "ria-fantasy-1",
    sectionId: "ria-fantasy",
    prompt:
      "I sometimes feel more connected to the version of this person in my mind than to the evidence I actually have.",
    scaleKey: "truth",
    dimensionWeights: {
      fantasy_projection: 1.6
    },
    highValueContextMarkers: ["mind_version_stronger"]
  }),
  choice({
    id: "ria-fantasy-2",
    sectionId: "ria-fantasy",
    prompt: "When the connection feels strongest, it is usually because:",
    type: "multiple_choice",
    options: [
      {
        id: "real-consistency",
        label: "We are actually having consistent, grounded contact.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "imagined-future",
        label: "I am imagining what the relationship could become if it fully opened up.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 3,
          release_resistance: 1
        },
        contextMarkers: ["future_projection"]
      },
      {
        id: "meaning-reading",
        label: "I am reading meaning into partial moments that could still mean several things.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 2,
          uncertainty_reinforcement: 2
        },
        contextMarkers: ["meaning_in_partial_moments"]
      },
      {
        id: "private-story",
        label: "The private story I carry feels more vivid than the shared reality.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 3
        },
        contextMarkers: ["private_story_dominant"]
      }
    ]
  }),
  scale({
    id: "ria-fantasy-3",
    sectionId: "ria-fantasy",
    prompt:
      "I can give more emotional weight to potential than to demonstrated consistency.",
    scaleKey: "agreement",
    dimensionWeights: {
      fantasy_projection: 1.4,
      uncertainty_reinforcement: 0.8
    }
  }),
  choice({
    id: "ria-fantasy-4",
    sectionId: "ria-fantasy",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "seeing-clearly",
        label: "I mostly see what is there, even if I wish it were more.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "building-from-fragments",
        label: "I can build a lot of feeling from fragments, hints, or rare moments.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 3,
          intrusive_focus: 1
        },
        contextMarkers: ["fragments_to_story"]
      }
    ]
  }),
  scale({
    id: "ria-fantasy-5",
    sectionId: "ria-fantasy",
    prompt:
      "I notice myself protecting the imagined version of the connection from evidence that does not fit it.",
    scaleKey: "agreement",
    dimensionWeights: {
      fantasy_projection: 1.5,
      release_resistance: 0.7
    },
    highValueContextMarkers: ["protecting_the_story"]
  }),
  scale({
    id: "ria-fantasy-6",
    sectionId: "ria-fantasy",
    prompt:
      "It is fairly easy for me to update my view of the connection when the actual evidence changes.",
    scaleKey: "agreement",
    dimensionWeights: {
      fantasy_projection: 1.4,
      release_resistance: 0.8
    },
    reverseScored: true
  }),
  scale({
    id: "ria-behavior-1",
    sectionId: "ria-behavior",
    prompt:
      "This attachment can quietly reorganize my mood, pace, or focus in ways other people may not immediately notice.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_abandonment: 1.3,
      intrusive_focus: 0.9
    }
  }),
  choice({
    id: "ria-behavior-2",
    sectionId: "ria-behavior",
    prompt: "My behavior around the attachment most often looks like:",
    type: "situational",
    options: [
      {
        id: "quietly-steady",
        label: "I stay fairly steady even if I care a lot.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "checking",
        label: "Checking, rereading, or monitoring more than I want to admit.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 2,
          uncertainty_reinforcement: 1
        },
        contextMarkers: ["monitoring_behavior"]
      },
      {
        id: "rearranging-day",
        label: "Rearranging my mood, schedule, or attention around contact possibilities.",
        value: 4,
        dimensionWeights: {
          self_abandonment: 3,
          intrusive_focus: 1
        },
        contextMarkers: ["life_rearranged_for_contact"]
      },
      {
        id: "hiding-how-much",
        label: "Hiding how much space this takes up internally while it still shapes me.",
        value: 3,
        dimensionWeights: {
          self_abandonment: 2,
          release_resistance: 1
        }
      }
    ]
  }),
  scale({
    id: "ria-behavior-3",
    sectionId: "ria-behavior",
    prompt:
      "I can neglect my own priorities when the attachment is especially active.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_abandonment: 1.6
    },
    highValueContextMarkers: ["priorities_displaced"]
  }),
  choice({
    id: "ria-behavior-4",
    sectionId: "ria-behavior",
    prompt: "If the person is suddenly warm or responsive, I am most likely to:",
    type: "situational",
    options: [
      {
        id: "enjoy-and-stay-grounded",
        label: "Enjoy it while still staying grounded.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "attach-more-meaning",
        label: "Attach a lot of meaning to what it might signal going forward.",
        value: 4,
        dimensionWeights: {
          uncertainty_reinforcement: 2,
          fantasy_projection: 2
        },
        contextMarkers: ["warmth_becomes_story"]
      },
      {
        id: "relax-then-crash",
        label: "Relax strongly, then crash if the energy changes again.",
        value: 4,
        dimensionWeights: {
          self_abandonment: 2,
          uncertainty_reinforcement: 2
        },
        contextMarkers: ["contact_driven_mood_swings"]
      },
      {
        id: "want-more-contact",
        label: "Want more contact immediately because the relief is hard to let go of.",
        value: 4,
        dimensionWeights: {
          intrusive_focus: 1,
          uncertainty_reinforcement: 1,
          release_resistance: 2
        },
        contextMarkers: ["relief_turns_into_chasing"]
      }
    ]
  }),
  scale({
    id: "ria-behavior-5",
    sectionId: "ria-behavior",
    prompt:
      "Part of my daily rhythm now quietly depends on whether the situation feels open, distant, or uncertain.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_abandonment: 1.4,
      intrusive_focus: 0.8
    }
  }),
  scale({
    id: "ria-behavior-6",
    sectionId: "ria-behavior",
    prompt:
      "I can care deeply about this person without losing too much contact with my own center of gravity.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_abandonment: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "ria-release-1",
    sectionId: "ria-release",
    prompt:
      "Even when part of me wants relief, another part resists letting the attachment actually soften.",
    scaleKey: "agreement",
    dimensionWeights: {
      release_resistance: 1.6
    },
    highValueContextMarkers: ["ambivalent_release"]
  }),
  choice({
    id: "ria-release-2",
    sectionId: "ria-release",
    prompt: "The hardest part about loosening the attachment would be:",
    type: "multiple_choice",
    options: [
      {
        id: "losing-hope",
        label: "Letting go of what it could still become.",
        value: 4,
        dimensionWeights: {
          fantasy_projection: 2,
          release_resistance: 2
        },
        contextMarkers: ["loss_of_potential"]
      },
      {
        id: "losing-intensity",
        label: "Losing the emotional intensity that has become familiar.",
        value: 4,
        dimensionWeights: {
          release_resistance: 3
        },
        contextMarkers: ["intensity_as_attachment"]
      },
      {
        id: "identity-shift",
        label: "Facing how much of me has organized around the situation.",
        value: 4,
        dimensionWeights: {
          self_abandonment: 2,
          release_resistance: 2
        },
        contextMarkers: ["attachment_embedded_in_identity"]
      },
      {
        id: "not-hardest",
        label: "It would hurt, but it would not feel especially hard to begin loosening.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "ria-release-3",
    sectionId: "ria-release",
    prompt:
      "I sometimes prefer staying emotionally activated over feeling the flatness that might come after real distance.",
    scaleKey: "agreement",
    dimensionWeights: {
      release_resistance: 1.5,
      intrusive_focus: 0.5
    }
  }),
  choice({
    id: "ria-release-4",
    sectionId: "ria-release",
    prompt: "If the attachment softened for real, I imagine I would mostly feel:",
    type: "situational",
    options: [
      {
        id: "peace",
        label: "More peaceful, even if there was still sadness.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "emptiness",
        label: "A disorienting emptiness that might pull me back toward the loop.",
        value: 4,
        dimensionWeights: {
          release_resistance: 3,
          self_abandonment: 1
        },
        contextMarkers: ["post_attachment_void"]
      },
      {
        id: "unfinished",
        label: "A sense that something meaningful was left unresolved.",
        value: 3,
        dimensionWeights: {
          release_resistance: 2,
          fantasy_projection: 1
        },
        contextMarkers: ["unfinished_meaning"]
      },
      {
        id: "self-rebuilding",
        label: "Relief mixed with the work of reconnecting to myself again.",
        value: 2,
        dimensionWeights: {
          self_abandonment: 1,
          release_resistance: 1
        }
      }
    ]
  }),
  scale({
    id: "ria-release-5",
    sectionId: "ria-release",
    prompt:
      "Part of me already knows there may be enough evidence to loosen the loop, but the emotional grip stays stronger than I expected.",
    scaleKey: "agreement",
    dimensionWeights: {
      release_resistance: 1.4,
      fantasy_projection: 0.7
    },
    highValueContextMarkers: ["evidence_has_not_reduced_grip"]
  }),
  scale({
    id: "ria-release-6",
    sectionId: "ria-release",
    prompt:
      "When I take real distance, the attachment usually starts to settle rather than getting louder.",
    scaleKey: "agreement",
    dimensionWeights: {
      release_resistance: 1.5,
      intrusive_focus: 0.6
    },
    reverseScored: true
  })
];

const infatuationAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "ria-occupancy",
        title: "Mental Reentry",
        description: "How much internal space the attachment is taking up.",
        intent: "Measure attention capture, emotional pull, and how quickly the loop reasserts itself."
      },
      {
        id: "ria-uncertainty",
        title: "Mixed Signals and Reinforcement",
        description: "How ambiguity, mixed signals, and partial contact affect intensity.",
        intent: "Capture whether uncertainty is acting like fuel rather than friction."
      },
      {
        id: "ria-fantasy",
        title: "Projected Meaning",
        description: "Where imagination is carrying more of the connection than reality is.",
        intent: "Measure projection, narrative building, and private certainty inflation."
      },
      {
        id: "ria-behavior",
        title: "Behavior Pull and Self-Shift",
        description: "How the attachment changes routines, mood, checking, and self-alignment.",
        intent: "Track what the loop is already costing in ordinary life."
      },
      {
        id: "ria-release",
        title: "Release and Reorientation",
        description: "What makes the loop difficult to loosen even when part of you wants relief.",
        intent: "Measure attachment persistence, identity embedding, and resistance to distance."
      }
    ],
    infatuationQuestions
  );

  return {
    id: "asm_relationship_infatuation_obsession_analysis",
    slug: "relationship-infatuation-obsession-analysis",
    topicKey: "relationship_infatuation",
    title: "Relationship Infatuation / Obsession Analysis",
    subtitle:
      "A deeper read on emotional preoccupation, mixed-signal sensitivity, and the difficulty of creating real distance.",
    category: "Attachment",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: infatuationQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You can already tell the attachment is taking too much space, but the loop still feels emotionally important, unfinished, or difficult to step out of.",
    previewPromise:
      "See whether the loop is being driven most by mental reentry, ambiguity, fantasy, self-disruption, or difficulty releasing it.",
    reportLabel: "Attachment-intensity insight report",
    focusAreas: [
      "Mental reentry and preoccupation",
      "Mixed-signal sensitivity",
      "Fantasy, hope, and self-disruption"
    ],
    outcomeHighlights: [
      "Separate ordinary longing from the more specific mechanics of fixation and emotional reinforcement.",
      "Show whether ambiguity, projection, or self-disruption is doing the most work in keeping the loop alive.",
      "Surface what makes distance, closure, or relief emotionally harder than expected."
    ],
    introBullets: [
      "Built for users who feel emotionally consumed, mentally preoccupied, or trapped in a relationship loop they cannot fully soften.",
      "Questions focus on ambiguity, imagined meaning, checking behavior, daily-life disruption, and the emotional cost of staying attached to what still feels unresolved.",
      "The resulting report is designed to feel psychologically precise, relationally credible, and useful for understanding why the loop still has a grip."
    ],
    bundleTags: ["attachment-and-recovery", "relationship-clarity"],
    categoryTags: ["attachment", "relationships", "emotional-patterns"],
    dimensions: infatuationDimensions,
    sections,
    questions: infatuationQuestions,
    relatedAssessments: [
      related(
        "attachment-and-relationship-style-report",
        "Useful if the fixation seems tied to wider reassurance, closeness, protest, or distance patterns."
      ),
      related(
        "closure-and-emotional-recovery-report",
        "Useful if the loop feels sustained by unfinished meaning, lingering hope, or difficulty making distance emotionally stick.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later support a private relationship-insight library, repeat-pattern recognition, and follow-up interpretation.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "relationship-infatuation-obsession-analysis",
      title: "Attachment Loop Insight Report",
      subtitle:
        "A premium report for fixation, mixed-signal reinforcement, fantasy projection, self-disruption, and release resistance.",
      previewPromises: previewSections(
        "See whether the loop is being led by uncertainty, imagination, or sheer mental reentry.",
        "Preview how the attachment is affecting ordinary life before a full report unlock."
      ),
      sectionTitles: {
        patternSummary: "Pattern Interpretation",
        whatResponsesSuggest: "Personalized Pattern Interpretation",
        emotionalDrivers: "Emotional Pressure Points",
        dailyLifeImpact: "Response Tendencies",
        blindSpots: "Hidden Friction Areas",
        stabilitySuggestions: "Stability and Clarity Suggestions",
        relatedInsights: "Related Insight Opportunities"
      },
      sectionDescriptions: {
        patternSummary:
          "An early read on whether the loop is being driven mainly by uncertainty, fantasy, self-disruption, or difficulty releasing it.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how attachment intensity and reinforcement appear to be combining.",
        emotionalDrivers:
          "Premium section on ambiguity, hope, projection, and the emotional mechanisms keeping the loop active.",
        dailyLifeImpact:
          "Premium section showing how the attachment shows up in mood, attention, routine, and relationship behavior.",
        blindSpots:
          "Premium section for hidden friction between hope and evidence, private story-building, and self-loss inside the loop.",
        stabilitySuggestions:
          "Premium section for calmer distance-building, clearer interpretation, and steadier emotional recovery.",
        relatedInsights:
          "Related relationship reports and bundle paths that make sense after this attachment-loop result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit attachment, closure, and relationship-pattern reports as repeat loops become clearer."
  } satisfies AssessmentDefinition;
})();

const toxicDimensions = [
  dimension(
    "boundary_tolerance",
    "Boundary Tolerance",
    "Tolerance",
    "limit-crossing behavior is being tolerated longer than your own standards would usually allow"
  ),
  dimension(
    "pattern_rationalization",
    "Pattern Rationalization",
    "Rationalize",
    "harmful or destabilizing behavior is being explained away to preserve the relationship"
  ),
  dimension(
    "emotional_dependency",
    "Emotional Dependency",
    "Dependency",
    "your emotional steadiness is becoming too tied to the relationship's current state"
  ),
  dimension(
    "signal_override",
    "Signal Override",
    "Signals",
    "warning signs are being minimized, postponed, or overruled in the moment"
  ),
  dimension(
    "conflict_avoidance",
    "Conflict Avoidance",
    "Avoidance",
    "clarity keeps getting delayed because confrontation or rupture feels too costly"
  )
];

const toxicQuestions = [
  scale({
    id: "tox-rec-1",
    sectionId: "tox-recognition",
    prompt:
      "I can already recognize a repeating cycle in this relationship, even if I still struggle to name what it means.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.1,
      pattern_rationalization: 0.8
    },
    highValueContextMarkers: ["repeating_cycle_noticed"]
  }),
  choice({
    id: "tox-rec-2",
    sectionId: "tox-recognition",
    prompt: "After a painful interaction, what usually pulls you back into the relationship fastest?",
    type: "situational",
    options: [
      {
        id: "consistent-repair",
        label: "A clear repair where the issue is named and actually addressed.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "brief-warmth",
        label: "A brief return to warmth that makes the problem feel less urgent.",
        value: 3,
        dimensionWeights: {
          pattern_rationalization: 2,
          emotional_dependency: 1
        },
        contextMarkers: ["warmth_resets_concern"]
      },
      {
        id: "intense-connection",
        label: "A strong moment of closeness that makes the rest feel easier to excuse.",
        value: 4,
        dimensionWeights: {
          emotional_dependency: 2,
          pattern_rationalization: 2
        },
        contextMarkers: ["intensity_rewrites_pattern"]
      },
      {
        id: "self-doubt",
        label: "A sense that maybe I misread what happened in the first place.",
        value: 4,
        dimensionWeights: {
          signal_override: 3,
          pattern_rationalization: 1
        },
        contextMarkers: ["self_doubt_resets_alarm"]
      }
    ]
  }),
  scale({
    id: "tox-rec-3",
    sectionId: "tox-recognition",
    prompt:
      "When something feels off, I can usually trust that reaction without spending much time arguing against it.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "tox-rec-4",
    sectionId: "tox-recognition",
    prompt: "The part of the pattern that concerns you most often is:",
    type: "multiple_choice",
    options: [
      {
        id: "unpredictable-shifts",
        label: "How quickly the tone can shift from warmth to strain.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          emotional_dependency: 1
        },
        contextMarkers: ["tone_instability"]
      },
      {
        id: "subtle-control",
        label: "How often guilt, pressure, or obligation seems to shape what is allowed.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          conflict_avoidance: 1
        },
        contextMarkers: ["obligation_pressure"]
      },
      {
        id: "mind-confusion",
        label: "How hard it is to stay clear about what happened after the fact.",
        value: 4,
        dimensionWeights: {
          signal_override: 3
        },
        contextMarkers: ["post_contact_confusion"]
      },
      {
        id: "none-consistent",
        label: "Nothing specific stands out consistently enough yet.",
        value: 1,
        dimensionWeights: {
          signal_override: 1
        }
      }
    ]
  }),
  scale({
    id: "tox-rec-5",
    sectionId: "tox-recognition",
    prompt:
      "My body or mood often registers strain before my mind is ready to call the pattern concerning.",
    scaleKey: "truth",
    dimensionWeights: {
      signal_override: 1.2,
      boundary_tolerance: 0.6
    },
    highValueContextMarkers: ["body_notices_first"]
  }),
  choice({
    id: "tox-rec-6",
    sectionId: "tox-recognition",
    prompt: "Which feels closer to the truth?",
    type: "forced_choice",
    options: [
      {
        id: "difficult-but-grounded",
        label: "The relationship is difficult at times, but I still feel basically grounded in my read of it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "keep-explaining-away",
        label: "I keep needing to explain away or downplay things that would worry me in another relationship.",
        value: 4,
        dimensionWeights: {
          pattern_rationalization: 2,
          signal_override: 2
        },
        contextMarkers: ["different_rules_for_this_relationship"]
      }
    ]
  }),
  scale({
    id: "tox-rec-7",
    sectionId: "tox-recognition",
    prompt:
      "If a neutral outsider saw several interactions, I suspect they would notice more pressure or imbalance than the relationship usually admits out loud.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.1,
      boundary_tolerance: 1.1
    },
    highValueContextMarkers: ["outsider_would_notice_pattern"]
  }),
  scale({
    id: "tox-int-1",
    sectionId: "tox-interpretation",
    prompt:
      "I spend a noticeable amount of energy explaining the other person's behavior to myself so I can stay settled.",
    scaleKey: "agreement",
    dimensionWeights: {
      pattern_rationalization: 1.6
    },
    highValueContextMarkers: ["active_explaining_away"]
  }),
  choice({
    id: "tox-int-2",
    sectionId: "tox-interpretation",
    prompt:
      "When you downplay the pattern, what reason feels most persuasive in the moment?",
    type: "multiple_choice",
    options: [
      {
        id: "they-are-stressed",
        label: "They are under pressure, so I tell myself it is not really about me.",
        value: 3,
        dimensionWeights: {
          pattern_rationalization: 3
        },
        contextMarkers: ["stress_used_as_override"]
      },
      {
        id: "they-mean-well",
        label: "Their intention seems good enough that I try to ignore the impact.",
        value: 4,
        dimensionWeights: {
          pattern_rationalization: 2,
          boundary_tolerance: 1
        },
        contextMarkers: ["impact_secondary_to_intent"]
      },
      {
        id: "i-might-be-harsh",
        label: "I worry I may be the one making it bigger than it is.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          conflict_avoidance: 1
        },
        contextMarkers: ["self_blame_softens_alarm"]
      },
      {
        id: "i-do-not-downplay",
        label: "If it feels wrong, I do not usually need to soften it for myself.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "tox-int-3",
    sectionId: "tox-interpretation",
    prompt:
      "After something unsettling happens, I can usually hold onto my version of events without much internal wobble.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.5,
      pattern_rationalization: 0.6
    },
    reverseScored: true
  }),
  choice({
    id: "tox-int-4",
    sectionId: "tox-interpretation",
    prompt: "If a friend described this exact pattern to you, you would most likely:",
    type: "situational",
    options: [
      {
        id: "see-it-clearly",
        label: "Recognize the concern faster than I do when it happens to me.",
        value: 4,
        dimensionWeights: {
          pattern_rationalization: 2,
          signal_override: 2
        },
        contextMarkers: ["clarity_for_others_not_self"]
      },
      {
        id: "need-context",
        label: "Want more context before deciding whether it is really a problem.",
        value: 2,
        dimensionWeights: {
          signal_override: 1
        }
      },
      {
        id: "encourage-boundary",
        label: "Tell them to take the pattern seriously and protect their footing.",
        value: 1,
        dimensionWeights: {
          boundary_tolerance: 1
        }
      },
      {
        id: "sound-normal",
        label: "Assume it probably sounds more concerning than it is.",
        value: 3,
        dimensionWeights: {
          pattern_rationalization: 2,
          signal_override: 1
        }
      }
    ]
  }),
  scale({
    id: "tox-int-5",
    sectionId: "tox-interpretation",
    prompt:
      "I notice myself focusing on their stress, history, or good moments so the harder pattern feels less decisive.",
    scaleKey: "agreement",
    dimensionWeights: {
      pattern_rationalization: 1.5,
      boundary_tolerance: 0.5
    }
  }),
  choice({
    id: "tox-int-6",
    sectionId: "tox-interpretation",
    prompt: "Which is more common after a difficult exchange?",
    type: "forced_choice",
    options: [
      {
        id: "question-their-behavior",
        label: "I stay focused on what they actually did and what it cost.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "question-my-read",
        label: "I start questioning whether I am being too sensitive, too rigid, or too unfair.",
        value: 4,
        dimensionWeights: {
          signal_override: 3,
          conflict_avoidance: 1
        },
        contextMarkers: ["questioning_my_read"]
      }
    ]
  }),
  scale({
    id: "tox-int-7",
    sectionId: "tox-interpretation",
    prompt:
      "A calmer or more affectionate interaction can make me rewrite the harder pattern faster than I want to.",
    scaleKey: "agreement",
    dimensionWeights: {
      pattern_rationalization: 1.4,
      emotional_dependency: 0.9,
      signal_override: 0.4
    },
    highValueContextMarkers: ["relief_rewrites_pattern"]
  }),
  scale({
    id: "tox-dep-1",
    sectionId: "tox-dependency",
    prompt:
      "The relationship can change the tone of my day more than I want to admit.",
    scaleKey: "impact",
    dimensionWeights: {
      emotional_dependency: 1.5
    },
    highValueContextMarkers: ["day_organized_by_relationship"]
  }),
  choice({
    id: "tox-dep-2",
    sectionId: "tox-dependency",
    prompt: "When tension rises, your most common move is to:",
    type: "situational",
    options: [
      {
        id: "name-it-directly",
        label: "Name the issue fairly directly so the relationship can either repair or clarify.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "soothe-fast",
        label: "Soothe the tension quickly, even if the real issue stays untouched.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 2,
          emotional_dependency: 2
        },
        contextMarkers: ["repair_before_clarity"]
      },
      {
        id: "overexplain",
        label: "Overexplain yourself so the other person does not pull away or escalate.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 2,
          boundary_tolerance: 1,
          emotional_dependency: 1
        },
        contextMarkers: ["overexplaining_to_preserve_bond"]
      },
      {
        id: "wait-for-reset",
        label: "Wait for the mood to reset on its own rather than risk making it worse.",
        value: 3,
        dimensionWeights: {
          conflict_avoidance: 3
        },
        contextMarkers: ["waiting_instead_of_addressing"]
      }
    ]
  }),
  scale({
    id: "tox-dep-3",
    sectionId: "tox-dependency",
    prompt:
      "I avoid bringing certain things up because disconnection feels harder to tolerate than the unresolved problem.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_dependency: 1.2,
      conflict_avoidance: 1.2
    },
    highValueContextMarkers: ["bond_preserved_over_clarity"]
  }),
  choice({
    id: "tox-dep-4",
    sectionId: "tox-dependency",
    prompt: "What makes clarity hardest right now?",
    type: "multiple_choice",
    options: [
      {
        id: "fear-of-anger",
        label: "The other person's anger, shutdown, or retaliation.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 3,
          boundary_tolerance: 1
        },
        contextMarkers: ["retaliation_fear"]
      },
      {
        id: "fear-of-loss",
        label: "How destabilizing it would feel to lose the connection entirely.",
        value: 4,
        dimensionWeights: {
          emotional_dependency: 3,
          conflict_avoidance: 1
        },
        contextMarkers: ["loss_fear_preserves_pattern"]
      },
      {
        id: "fear-of-being-wrong",
        label: "The possibility that I might finally be firm and still be misreading it.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          conflict_avoidance: 2
        },
        contextMarkers: ["wrongness_fear_blocks_action"]
      },
      {
        id: "not-especially-hard",
        label: "Clarity is not actually the hard part for me right now.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "tox-dep-5",
    sectionId: "tox-dependency",
    prompt:
      "I can stay emotionally steady even when this person is distant, displeased, or hard to read.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_dependency: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "tox-dep-6",
    sectionId: "tox-dependency",
    prompt: "Which private rule feels more familiar?",
    type: "forced_choice",
    options: [
      {
        id: "truth-can-hold",
        label: "A worthwhile connection should be able to tolerate truth and limits.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "keep-the-bond-steady",
        label: "I often need to manage myself carefully to keep the bond from tilting into strain.",
        value: 4,
        dimensionWeights: {
          emotional_dependency: 2,
          conflict_avoidance: 2
        },
        contextMarkers: ["self_management_to_hold_connection"]
      }
    ]
  }),
  scale({
    id: "tox-dep-7",
    sectionId: "tox-dependency",
    prompt:
      "My plans, focus, or sleep can shift noticeably depending on whether this relationship currently feels settled.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_dependency: 1.4,
      conflict_avoidance: 0.5
    },
    highValueContextMarkers: ["life_moves_with_relationship_state"]
  }),
  scale({
    id: "tox-bound-1",
    sectionId: "tox-boundaries",
    prompt:
      "I have accepted behavior here that I would likely challenge more quickly in another relationship.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_tolerance: 1.6
    },
    highValueContextMarkers: ["special_exceptions_for_this_bond"]
  }),
  choice({
    id: "tox-bound-2",
    sectionId: "tox-boundaries",
    prompt: "If you said, \"This does not work for me,\" you most expect the response would be:",
    type: "situational",
    options: [
      {
        id: "respectful-engagement",
        label: "Respectful engagement, even if they do not fully agree.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "defensive-turn",
        label: "Defensiveness that shifts the focus away from the original issue.",
        value: 3,
        dimensionWeights: {
          conflict_avoidance: 2,
          boundary_tolerance: 1
        },
        contextMarkers: ["defensiveness_after_boundary"]
      },
      {
        id: "guilt-pressure",
        label: "Some form of guilt, hurt, or obligation pressure.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          emotional_dependency: 1,
          conflict_avoidance: 1
        },
        contextMarkers: ["guilt_after_boundary"]
      },
      {
        id: "brief-change",
        label: "A brief improvement that does not really hold.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          pattern_rationalization: 2
        },
        contextMarkers: ["short_lived_improvement"]
      }
    ]
  }),
  scale({
    id: "tox-bound-3",
    sectionId: "tox-boundaries",
    prompt:
      "My standards can quietly shift downward in this relationship because I am trying to stay realistic, calm, or fair.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_tolerance: 1.4,
      pattern_rationalization: 0.8
    }
  }),
  choice({
    id: "tox-bound-4",
    sectionId: "tox-boundaries",
    prompt: "The boundary that gets hardest to hold here is usually around:",
    type: "multiple_choice",
    options: [
      {
        id: "tone-and-respect",
        label: "Tone, respect, and how I am spoken to.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 3
        },
        contextMarkers: ["respect_boundary_eroded"]
      },
      {
        id: "time-and-access",
        label: "Time, access, or responsiveness expectations.",
        value: 3,
        dimensionWeights: {
          emotional_dependency: 2,
          boundary_tolerance: 1
        }
      },
      {
        id: "privacy-and-autonomy",
        label: "Privacy, independence, or freedom to make my own decisions.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          conflict_avoidance: 1
        },
        contextMarkers: ["autonomy_pressure"]
      },
      {
        id: "emotional-labor",
        label: "How much emotional management I end up doing to keep things functional.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 2,
          emotional_dependency: 1,
          boundary_tolerance: 1
        },
        contextMarkers: ["excessive_emotional_management"]
      }
    ]
  }),
  scale({
    id: "tox-bound-5",
    sectionId: "tox-boundaries",
    prompt:
      "Once I decide something crosses a line, I can usually act on that decision fairly quickly.",
    scaleKey: "agreement",
    dimensionWeights: {
      boundary_tolerance: 1.5,
      conflict_avoidance: 0.8
    },
    reverseScored: true
  }),
  choice({
    id: "tox-bound-6",
    sectionId: "tox-boundaries",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "limits-can-live",
        label: "The relationship could probably survive more honest limits than I sometimes assume.",
        value: 1,
        dimensionWeights: {
          conflict_avoidance: 1
        }
      },
      {
        id: "bond-requires-flexing",
        label: "The relationship often feels workable only because I keep flexing more than I want to.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          conflict_avoidance: 2
        },
        contextMarkers: ["bond_depends_on_my_flexing"]
      }
    ]
  }),
  choice({
    id: "tox-bound-7",
    sectionId: "tox-boundaries",
    prompt:
      "When I try to reclaim time, space, or autonomy, the pressure usually sounds most like:",
    type: "multiple_choice",
    options: [
      {
        id: "clear-respect",
        label: "A respectful adjustment, even if the other person is disappointed.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "why-make-problem",
        label: "\"Why are you turning this into a problem when things were fine?\"",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          conflict_avoidance: 2
        },
        contextMarkers: ["boundary_reframed_as_problem"]
      },
      {
        id: "i-care-more",
        label: "\"I guess I just care more than you do.\"",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 2,
          emotional_dependency: 1,
          boundary_tolerance: 1
        },
        contextMarkers: ["guilt_for_taking_space"]
      },
      {
        id: "fine-do-whatever",
        label: "\"Fine, do whatever you want,\" in a way that makes the space feel costly.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          conflict_avoidance: 2
        },
        contextMarkers: ["space_made_costly"]
      }
    ]
  }),
  scale({
    id: "tox-clear-1",
    sectionId: "tox-clarity",
    prompt:
      "Part of me already knows the pattern costs too much, but more distance still feels emotionally complicated.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_dependency: 1.1,
      boundary_tolerance: 1,
      conflict_avoidance: 0.7
    },
    highValueContextMarkers: ["distance_feels_complicated"]
  }),
  choice({
    id: "tox-clear-2",
    sectionId: "tox-clarity",
    prompt: "If you took real distance, the hardest part would most likely be:",
    type: "multiple_choice",
    options: [
      {
        id: "missing-intensity",
        label: "Missing the intensity, closeness, or emotional pull.",
        value: 4,
        dimensionWeights: {
          emotional_dependency: 3
        },
        contextMarkers: ["distance_means_losing_intensity"]
      },
      {
        id: "admitting-seriousness",
        label: "Admitting to yourself how serious the pattern may actually be.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          pattern_rationalization: 2
        },
        contextMarkers: ["distance_requires_honest_naming"]
      },
      {
        id: "dealing-with-fallout",
        label: "Managing the practical or relational fallout that might follow.",
        value: 3,
        dimensionWeights: {
          conflict_avoidance: 2,
          boundary_tolerance: 1
        }
      },
      {
        id: "distance-would-help",
        label: "Distance would be painful, but I suspect it would also clarify a lot.",
        value: 1,
        dimensionWeights: {
          signal_override: 1
        }
      }
    ]
  }),
  scale({
    id: "tox-clear-3",
    sectionId: "tox-clarity",
    prompt:
      "Short periods of relief can make me question whether the larger pattern is still a problem at all.",
    scaleKey: "agreement",
    dimensionWeights: {
      pattern_rationalization: 1.4,
      signal_override: 0.8
    }
  }),
  choice({
    id: "tox-clear-4",
    sectionId: "tox-clarity",
    prompt: "The clearest sign this relationship is affecting you more than you want to admit would be:",
    type: "multiple_choice",
    options: [
      {
        id: "smaller-self",
        label: "You feel smaller, more careful, or less solid in yourself around it.",
        value: 4,
        dimensionWeights: {
          boundary_tolerance: 2,
          signal_override: 1,
          emotional_dependency: 1
        },
        contextMarkers: ["self_constriction"]
      },
      {
        id: "constant-monitoring",
        label: "You spend more time monitoring the pattern than you say out loud.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          emotional_dependency: 1
        },
        contextMarkers: ["monitoring_without_naming"]
      },
      {
        id: "protecting-their-image",
        label: "You protect their image more consistently than you protect your own clarity.",
        value: 4,
        dimensionWeights: {
          pattern_rationalization: 3,
          boundary_tolerance: 1
        },
        contextMarkers: ["image_protection_over_clarity"]
      },
      {
        id: "postponing-action",
        label: "You keep postponing a conversation, limit, or decision you already know matters.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 2,
          boundary_tolerance: 2
        },
        contextMarkers: ["postponed_necessary_action"]
      }
    ]
  }),
  scale({
    id: "tox-clear-5",
    sectionId: "tox-clarity",
    prompt:
      "More distance usually brings me clearer judgment rather than stronger confusion.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.3,
      emotional_dependency: 0.8
    },
    reverseScored: true
  }),
  choice({
    id: "tox-clear-6",
    sectionId: "tox-clarity",
    prompt: "What would help you trust your read fastest right now?",
    type: "situational",
    options: [
      {
        id: "outside-perspective",
        label: "Enough emotional distance or outside perspective to hear yourself more clearly.",
        value: 4,
        dimensionWeights: {
          signal_override: 2,
          pattern_rationalization: 1
        },
        contextMarkers: ["needs_external_reality_check"]
      },
      {
        id: "consistent-respect",
        label: "Consistent respectful behavior that does not require constant reinterpretation.",
        value: 3,
        dimensionWeights: {
          boundary_tolerance: 2,
          signal_override: 1
        }
      },
      {
        id: "their-accountability",
        label: "Direct accountability from them rather than another cycle of minimization.",
        value: 4,
        dimensionWeights: {
          conflict_avoidance: 1,
          boundary_tolerance: 2,
          pattern_rationalization: 1
        },
        contextMarkers: ["accountability_missing"]
      },
      {
        id: "i-already-trust-it",
        label: "I mostly trust my read already; the hard part is deciding what to do with it.",
        value: 2,
        dimensionWeights: {
          boundary_tolerance: 1,
          conflict_avoidance: 1
        }
      }
    ]
  }),
  scale({
    id: "tox-clear-7",
    sectionId: "tox-clarity",
    prompt:
      "If the same pattern happened to someone I care about, I would probably take it more seriously for them than I have for myself.",
    scaleKey: "agreement",
    dimensionWeights: {
      signal_override: 1.2,
      pattern_rationalization: 1.1,
      boundary_tolerance: 0.7
    },
    highValueContextMarkers: ["clearer_for_others_than_self"]
  })
];

const toxicAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "tox-recognition",
        title: "Recognition and Pattern Signals",
        description: "How clearly the pattern is already showing itself across time and context.",
        intent: "Separate isolated difficulty from a repeatable destabilizing dynamic."
      },
      {
        id: "tox-interpretation",
        title: "Interpretation and Self-Doubt",
        description: "How often you soften, reinterpret, or overrule warning signs after the fact.",
        intent: "Measure rationalization, self-doubt, and signal suppression."
      },
      {
        id: "tox-dependency",
        title: "Dependency and Conflict Pressure",
        description: "How much the bond influences your steadiness and willingness to name the truth.",
        intent: "Capture emotional dependency and the cost of confrontation."
      },
      {
        id: "tox-boundaries",
        title: "Boundary Strain",
        description: "Where your limits, standards, or self-protection have become harder to hold.",
        intent: "Measure how much the relationship has shifted what feels acceptable."
      },
      {
        id: "tox-clarity",
        title: "Distance and Clarity",
        description: "What happens when you imagine distance, truth, or a firmer line.",
        intent: "Assess whether clarity is available and what still makes action emotionally hard."
      }
    ],
    toxicQuestions
  );

  return {
    id: "asm_toxic_pattern_red_flag_report",
    slug: "toxic-pattern-and-red-flag-report",
    topicKey: "toxic_pattern",
    title: "Toxic Pattern & Red Flag Report",
    subtitle:
      "A serious read on destabilizing relationship behavior, boundary strain, and the warning signs that get harder to dismiss over time.",
    category: "Relationship Dynamics",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: toxicQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You are trying to sort out whether a relationship dynamic is merely painful, steadily destabilizing, or already asking too much of your judgment, nervous system, and boundaries.",
    previewPromise:
      "See whether the pattern is being driven most by signal override, emotional dependency, rationalization, conflict avoidance, or eroded boundaries.",
    reportLabel: "Relationship red-flag insight report",
    focusAreas: [
      "Warning-sign recognition and self-trust",
      "Rationalization and emotional dependency",
      "Boundary strain and conflict pressure"
    ],
    outcomeHighlights: [
      "Separate ordinary relationship strain from repeated destabilizing patterns.",
      "Show whether confusion, dependency, or avoidance is doing the most work in keeping the dynamic active.",
      "Clarify where self-protection has become harder to trust or act on."
    ],
    introBullets: [
      "Built for situations that feel emotionally costly, hard to name cleanly, or strangely easier to excuse from the inside than they would be from the outside.",
      "Questions focus on repeated warning signs, self-doubt after contact, boundary adaptation, conflict pressure, and how much the relationship now shapes your internal steadiness.",
      "The resulting report is designed to help you tell the difference between pain, confusion, and a pattern that may deserve firmer clarity than you have been giving it."
    ],
    bundleTags: ["relationship-clarity", "boundary-signals"],
    categoryTags: ["relationships", "red-flags", "safety"],
    dimensions: toxicDimensions,
    sections,
    questions: toxicQuestions,
    relatedAssessments: [
      related(
        "condescending-behavior-decoder",
        "Useful when the destabilizing pattern is subtle, socially polished, or difficult to name because it often hides inside tone and deniability."
      ),
      related(
        "closure-and-emotional-recovery-report",
        "Useful if part of you is already trying to detach, recover, or understand why distance has not become emotionally clean yet.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later keep relationship-pattern reports in one place and support comparison across attachment, red-flag, and recovery themes.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "toxic-pattern-and-red-flag-report",
      title: "Relationship Red-Flag Insight Report",
      subtitle:
        "A premium report for destabilizing dynamics, signal override, dependency pressure, and boundary strain.",
      previewPromises: previewSections(
        "See whether the clearest issue is confusion, dependency, avoidance, or the erosion of your own limits.",
        "Preview how warning signs, emotional dependency, and self-protective hesitation appear to be clustering."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the strongest destabilizing pattern visible in the relationship right now.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how warning signs, rationalization, emotional pull, and boundary strain appear to be interacting.",
        emotionalDrivers:
          "Premium section on emotional leverage, fear of rupture, intermittent relief, and the pressure points underneath the pattern.",
        dailyLifeImpact:
          "Premium section translating the dynamic into real behavior, self-protection shifts, and ordinary-life consequences.",
        blindSpots:
          "Premium section surfacing what keeps the pattern hard to name, act on, or trust in yourself.",
        stabilitySuggestions:
          "Premium section for regaining clearer footing, steadier boundaries, and more reliable self-trust.",
        relatedInsights:
          "Related relationship reports and bundle paths that make sense after this red-flag result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to continue into attachment, closure, boundary, and relationship-pattern reports."
  } satisfies AssessmentDefinition;
})();

const emotionalDetachmentDimensions = [
  dimension(
    "meaning_erosion",
    "Meaning Erosion",
    "Meaning",
    "purpose, significance, or felt connection to daily life is fading in a way that feels hard to reverse"
  ),
  dimension(
    "emotional_disengagement",
    "Emotional Disengagement",
    "Disengage",
    "emotional contact with your own experience feels muted, distant, or difficult to access"
  ),
  dimension(
    "existential_fatigue",
    "Existential Fatigue",
    "Fatigue",
    "life feels more effortful, repetitive, or internally drained at the level of meaning itself"
  ),
  dimension(
    "social_withdrawal",
    "Social Withdrawal",
    "Withdraw",
    "distance from people is becoming the default rather than the exception"
  ),
  dimension(
    "motivational_flattening",
    "Motivational Flattening",
    "Flattening",
    "the inner pull toward ordinary participation is growing weaker or less reliable"
  )
];

const emotionalDetachmentQuestions = [
  scale({
    id: "edi-range-1",
    sectionId: "edi-range",
    prompt:
      "Experiences that should register emotionally can feel strangely distant, muted, or hard to fully enter.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_disengagement: 1.6
    },
    highValueContextMarkers: ["muted_emotional_contact"]
  }),
  choice({
    id: "edi-range-2",
    sectionId: "edi-range",
    prompt: "When something objectively good happens, your reaction is most often:",
    type: "situational",
    options: [
      {
        id: "it-lands",
        label: "I can genuinely feel the good in it, even if briefly.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "thin-recognition",
        label: "I know it is good, but the emotional registration feels thin.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 3,
          motivational_flattening: 1
        },
        contextMarkers: ["good_without_felt_contact"]
      },
      {
        id: "brief-then-fade",
        label: "It lands for a moment, then goes flat almost immediately.",
        value: 3,
        dimensionWeights: {
          emotional_disengagement: 2,
          meaning_erosion: 1
        }
      },
      {
        id: "why-care",
        label: "My mind can jump quickly to why it should not matter that much anyway.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          existential_fatigue: 2
        },
        contextMarkers: ["meaning_declines_after_positive_event"]
      }
    ]
  }),
  scale({
    id: "edi-range-3",
    sectionId: "edi-range",
    prompt:
      "I can still feel moved, interested, or emotionally reached in ordinary moments more often than not.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_disengagement: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "edi-range-4",
    sectionId: "edi-range",
    prompt: "The state shows up most clearly as:",
    type: "multiple_choice",
    options: [
      {
        id: "muted-feeling",
        label: "A muted emotional range, as if life reaches me less directly.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 3
        },
        contextMarkers: ["felt_range_reduced"]
      },
      {
        id: "less-meaning",
        label: "A quieter loss of meaning, significance, or personal investment.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 3
        },
        contextMarkers: ["meaning_thinning"]
      },
      {
        id: "deep-tiredness",
        label: "A deeper tiredness with life feeling repetitive or difficult to care about.",
        value: 4,
        dimensionWeights: {
          existential_fatigue: 3
        },
        contextMarkers: ["existential_heaviness"]
      },
      {
        id: "staying-away",
        label: "An increasing habit of staying inward and away from other people.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 3
        },
        contextMarkers: ["people_feel_farther_away"]
      }
    ]
  }),
  scale({
    id: "edi-range-5",
    sectionId: "edi-range",
    prompt:
      "I sometimes notice myself observing life from a distance instead of feeling fully inside it.",
    scaleKey: "truth",
    dimensionWeights: {
      emotional_disengagement: 1.2,
      existential_fatigue: 0.8
    },
    highValueContextMarkers: ["observer_mode"]
  }),
  choice({
    id: "edi-range-6",
    sectionId: "edi-range",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "too-much-at-times",
        label: "I still feel a lot, but sometimes wish it were easier to regulate.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "less-than-expected",
        label: "I often feel less than I expect to, even when the moment should reach me.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 2,
          meaning_erosion: 1,
          motivational_flattening: 1
        },
        contextMarkers: ["under_response_is_pattern"]
      }
    ]
  }),
  scale({
    id: "edi-range-7",
    sectionId: "edi-range",
    prompt:
      "Music, stories, or ordinary moments that used to move me can now register more as information than as felt experience.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_disengagement: 1.4,
      meaning_erosion: 0.7
    },
    highValueContextMarkers: ["emotion_becomes_information"]
  }),
  scale({
    id: "edi-meaning-1",
    sectionId: "edi-meaning",
    prompt:
      "Things I used to care about can now feel conceptually important but internally less alive.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 1.6
    },
    highValueContextMarkers: ["values_feel_farther_away"]
  }),
  choice({
    id: "edi-meaning-2",
    sectionId: "edi-meaning",
    prompt: "When you think about the near future, it most often feels:",
    type: "multiple_choice",
    options: [
      {
        id: "grounded-interest",
        label: "Reasonably open, even if not exciting all the time.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "functional-only",
        label: "Mostly functional, like something to manage rather than enter.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          motivational_flattening: 2
        },
        contextMarkers: ["future_as_maintenance"]
      },
      {
        id: "heavy-and-repetitive",
        label: "Heavy, repetitive, or difficult to feel personally connected to.",
        value: 4,
        dimensionWeights: {
          existential_fatigue: 3,
          meaning_erosion: 1
        },
        contextMarkers: ["future_feels_weighted_down"]
      },
      {
        id: "too-far-away",
        label: "Too far away to generate much emotional pull one way or the other.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          emotional_disengagement: 1,
          motivational_flattening: 1
        },
        contextMarkers: ["future_has_low_pull"]
      }
    ]
  }),
  scale({
    id: "edi-meaning-3",
    sectionId: "edi-meaning",
    prompt:
      "Questions like \"what is the point of this\" show up more often now as fatigue than as curiosity.",
    scaleKey: "agreement",
    dimensionWeights: {
      existential_fatigue: 1.5,
      meaning_erosion: 0.8
    },
    highValueContextMarkers: ["point_of_this_fatigue"]
  }),
  choice({
    id: "edi-meaning-4",
    sectionId: "edi-meaning",
    prompt: "If a day goes by smoothly, your private reaction is most likely:",
    type: "situational",
    options: [
      {
        id: "quiet-gratitude",
        label: "A quiet sense that the day mattered in its own way.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "fine-but-empty",
        label: "It was fine, but the day still feels emotionally blank.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          emotional_disengagement: 1,
          motivational_flattening: 1
        },
        contextMarkers: ["smooth_day_still_blank"]
      },
      {
        id: "hard-to-care",
        label: "A thought that even the better days do not change much internally.",
        value: 4,
        dimensionWeights: {
          existential_fatigue: 2,
          meaning_erosion: 2
        },
        contextMarkers: ["better_days_do_not_register"]
      },
      {
        id: "one-less-thing",
        label: "Mostly relief that nothing else had to be dealt with.",
        value: 3,
        dimensionWeights: {
          existential_fatigue: 2,
          motivational_flattening: 1
        }
      }
    ]
  }),
  scale({
    id: "edi-meaning-5",
    sectionId: "edi-meaning",
    prompt:
      "Meaning now feels harder to access even in areas of life that still matter to me in principle.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 1.5,
      existential_fatigue: 0.7
    }
  }),
  scale({
    id: "edi-meaning-6",
    sectionId: "edi-meaning",
    prompt:
      "Even when life feels demanding, I can still locate some steady sense of personal significance underneath it.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "edi-meaning-7",
    sectionId: "edi-meaning",
    prompt:
      "I can keep doing what life requires while feeling less sure why it still matters to me personally.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 1.3,
      existential_fatigue: 0.8,
      motivational_flattening: 0.5
    },
    highValueContextMarkers: ["function_without_personal_meaning"]
  }),
  scale({
    id: "edi-social-1",
    sectionId: "edi-social",
    prompt:
      "Being around other people can feel more draining because I am participating without fully feeling present.",
    scaleKey: "agreement",
    dimensionWeights: {
      social_withdrawal: 1.2,
      emotional_disengagement: 0.9
    }
  }),
  choice({
    id: "edi-social-2",
    sectionId: "edi-social",
    prompt: "When someone reaches out with genuine warmth, your most common response is:",
    type: "situational",
    options: [
      {
        id: "can-receive",
        label: "I can usually receive it, even if I do not always have much energy.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "appreciate-but-far",
        label: "I appreciate it, but still feel strangely far away from it.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          emotional_disengagement: 2
        },
        contextMarkers: ["warmth_does_not_bridge_distance"]
      },
      {
        id: "delay-response",
        label: "I delay or minimize my response because engaging feels heavier than it should.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 3,
          motivational_flattening: 1
        },
        contextMarkers: ["reaching_back_feels_heavy"]
      },
      {
        id: "cannot-explain",
        label: "I want to respond well, but something in me cannot fully get there.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 2,
          social_withdrawal: 2
        },
        contextMarkers: ["internal_distance_blocks_connection"]
      }
    ]
  }),
  scale({
    id: "edi-social-3",
    sectionId: "edi-social",
    prompt:
      "I find myself opting out of connection not because I dislike people, but because it is hard to feel fully there once I show up.",
    scaleKey: "agreement",
    dimensionWeights: {
      social_withdrawal: 1.5,
      emotional_disengagement: 0.8
    },
    highValueContextMarkers: ["withdrawal_due_to_inner_distance"]
  }),
  choice({
    id: "edi-social-4",
    sectionId: "edi-social",
    prompt: "Conversations feel most difficult when they require you to:",
    type: "multiple_choice",
    options: [
      {
        id: "perform-energy",
        label: "Perform more energy or interest than you naturally have available.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          emotional_disengagement: 1,
          existential_fatigue: 1
        },
        contextMarkers: ["performing_presence"]
      },
      {
        id: "say-how-you-feel",
        label: "Say how you actually feel when what you feel is hard to reach.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 3
        },
        contextMarkers: ["feeling_is_hard_to_access"]
      },
      {
        id: "care-in-real-time",
        label: "Stay interested in the exchange when your mind goes flat or far away.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 2,
          social_withdrawal: 2
        },
        contextMarkers: ["engagement_drops_in_conversation"]
      },
      {
        id: "not-especially-hard",
        label: "Connection is not the main area where the state shows up for me.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "edi-social-5",
    sectionId: "edi-social",
    prompt:
      "Even people I care about can start to feel farther away than I want them to.",
    scaleKey: "agreement",
    dimensionWeights: {
      social_withdrawal: 1.5,
      meaning_erosion: 0.6
    }
  }),
  scale({
    id: "edi-social-6",
    sectionId: "edi-social",
    prompt:
      "I can usually stay relationally available without having to work unusually hard at it.",
    scaleKey: "agreement",
    dimensionWeights: {
      social_withdrawal: 1.4,
      emotional_disengagement: 0.7
    },
    reverseScored: true
  }),
  choice({
    id: "edi-social-7",
    sectionId: "edi-social",
    prompt:
      "If someone invites me into something simple and low-pressure, I am most likely to:",
    type: "situational",
    options: [
      {
        id: "go-if-capacity-allows",
        label: "Go if I reasonably can, without much internal drag.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "delay-until-passes",
        label: "Want to go in theory, but delay until the invitation quietly passes.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          motivational_flattening: 2
        },
        contextMarkers: ["low_pressure_invite_still_passes"]
      },
      {
        id: "show-up-inwardly-far",
        label: "Show up, but feel inwardly absent once I am there.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          emotional_disengagement: 2
        },
        contextMarkers: ["present_but_not_in_it"]
      },
      {
        id: "decline-because-presence-costly",
        label: "Decline because the effort to feel present seems higher than the interaction itself.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 3,
          existential_fatigue: 1
        },
        contextMarkers: ["presence_cost_too_high"]
      }
    ]
  }),
  scale({
    id: "edi-engage-1",
    sectionId: "edi-engagement",
    prompt:
      "A lot of daily life can feel like something to move through rather than something to inhabit.",
    scaleKey: "agreement",
    dimensionWeights: {
      motivational_flattening: 1.1,
      existential_fatigue: 1.1,
      emotional_disengagement: 0.6
    },
    highValueContextMarkers: ["life_as_process_not_participation"]
  }),
  choice({
    id: "edi-engage-2",
    sectionId: "edi-engagement",
    prompt: "When you notice yourself pulling back from life, it usually looks like:",
    type: "multiple_choice",
    options: [
      {
        id: "doing-only-what-is-needed",
        label: "Doing what is needed while quietly dropping anything that asks for felt engagement.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 2,
          meaning_erosion: 1,
          emotional_disengagement: 1
        },
        contextMarkers: ["life_reduced_to_maintenance"]
      },
      {
        id: "not-starting-extras",
        label: "Not starting things that used to make life feel fuller or more dimensional.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 3
        },
        contextMarkers: ["extra_life_activity_dropped"]
      },
      {
        id: "quiet-canceling",
        label: "Quietly canceling or avoiding because participating feels emotionally thin.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          motivational_flattening: 2
        }
      },
      {
        id: "mostly-unchanged",
        label: "My outer routines are mostly unchanged even if the state is still present.",
        value: 1,
        dimensionWeights: {
          existential_fatigue: 1
        }
      }
    ]
  }),
  scale({
    id: "edi-engage-3",
    sectionId: "edi-engagement",
    prompt:
      "Tasks or plans can feel harder to enter because the emotional reason for entering them has gone quiet.",
    scaleKey: "agreement",
    dimensionWeights: {
      motivational_flattening: 1.3,
      meaning_erosion: 0.9
    }
  }),
  choice({
    id: "edi-engage-4",
    sectionId: "edi-engagement",
    prompt: "If you do push yourself to engage more, the result is often:",
    type: "situational",
    options: [
      {
        id: "genuine-return",
        label: "Some real return of interest once I get moving.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "functional-only",
        label: "A functional performance without much felt return.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 2,
          emotional_disengagement: 2
        },
        contextMarkers: ["engagement_without_return"]
      },
      {
        id: "tired-afterward",
        label: "More depletion afterward than renewed connection.",
        value: 4,
        dimensionWeights: {
          existential_fatigue: 2,
          motivational_flattening: 2
        },
        contextMarkers: ["effort_depletes_more_than_restores"]
      },
      {
        id: "short-window",
        label: "A short window of return that closes faster than I want it to.",
        value: 3,
        dimensionWeights: {
          emotional_disengagement: 1,
          motivational_flattening: 2
        }
      }
    ]
  }),
  scale({
    id: "edi-engage-5",
    sectionId: "edi-engagement",
    prompt:
      "Indifference has started to feel easier to manage than caring deeply again.",
    scaleKey: "agreement",
    dimensionWeights: {
      existential_fatigue: 1.2,
      emotional_disengagement: 1,
      motivational_flattening: 0.6
    },
    highValueContextMarkers: ["indifference_feels_safer"]
  }),
  scale({
    id: "edi-engage-6",
    sectionId: "edi-engagement",
    prompt:
      "Even when I am tired or strained, I can usually find some real internal pull toward participation.",
    scaleKey: "agreement",
    dimensionWeights: {
      motivational_flattening: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "edi-engage-7",
    sectionId: "edi-engagement",
    prompt:
      "Unstructured time can pass with very little felt preference for how I want to use it.",
    scaleKey: "agreement",
    dimensionWeights: {
      motivational_flattening: 1.3,
      meaning_erosion: 0.8,
      emotional_disengagement: 0.5
    },
    highValueContextMarkers: ["unstructured_time_has_low_pull"]
  }),
  scale({
    id: "edi-return-1",
    sectionId: "edi-reentry",
    prompt:
      "Part of me wants to feel more connected again, but another part feels strangely resistant to re-entering fully.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_disengagement: 1.1,
      existential_fatigue: 1,
      social_withdrawal: 0.6
    },
    highValueContextMarkers: ["reentry_resistance"]
  }),
  choice({
    id: "edi-return-2",
    sectionId: "edi-reentry",
    prompt: "What makes fuller re-engagement feel hardest right now?",
    type: "multiple_choice",
    options: [
      {
        id: "nothing-feels-worth-force",
        label: "Forcing meaning or feeling would feel artificial and tiring.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          existential_fatigue: 2
        },
        contextMarkers: ["forcing_meaning_feels_false"]
      },
      {
        id: "cannot-feel-enough",
        label: "I do not trust that I can feel enough for it to be real yet.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 3,
          motivational_flattening: 1
        },
        contextMarkers: ["not_enough_felt_contact_for_reentry"]
      },
      {
        id: "people-feel-far",
        label: "Other people or roles still feel farther away than I want them to.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 3,
          emotional_disengagement: 1
        }
      },
      {
        id: "energy-just-low",
        label: "The energy cost still feels too high compared with the return.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 2,
          existential_fatigue: 2
        },
        contextMarkers: ["return_seems_low_compared_with_cost"]
      }
    ]
  }),
  scale({
    id: "edi-return-3",
    sectionId: "edi-reentry",
    prompt:
      "I worry less about being overwhelmed by life right now than about staying disengaged from it for too long.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 0.8,
      emotional_disengagement: 1.1
    }
  }),
  choice({
    id: "edi-return-4",
    sectionId: "edi-reentry",
    prompt: "If a small sense of aliveness returns, you are most likely to:",
    type: "situational",
    options: [
      {
        id: "stay-with-it",
        label: "Notice it and let yourself stay with it without much argument.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "distrust-it",
        label: "Distrust it because it feels too brief or too fragile to count.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 2,
          meaning_erosion: 1,
          existential_fatigue: 1
        },
        contextMarkers: ["aliveness_dismissed_too_fast"]
      },
      {
        id: "feel-sad",
        label: "Feel sadness about how long you have been away from that feeling.",
        value: 3,
        dimensionWeights: {
          emotional_disengagement: 1,
          meaning_erosion: 1,
          existential_fatigue: 1
        }
      },
      {
        id: "want-more-but-cannot-hold",
        label: "Want more of it, but struggle to hold onto it long enough to build from it.",
        value: 4,
        dimensionWeights: {
          motivational_flattening: 2,
          emotional_disengagement: 2
        },
        contextMarkers: ["brief_return_cannot_be_stabilized"]
      }
    ]
  }),
  scale({
    id: "edi-return-5",
    sectionId: "edi-reentry",
    prompt:
      "A quieter part of me still wants reconnection, even if the route back feels unclear.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_erosion: 0.5,
      emotional_disengagement: 0.5,
      motivational_flattening: 0.5
    },
    reverseScored: true
  }),
  scale({
    id: "edi-return-6",
    sectionId: "edi-reentry",
    prompt:
      "The longer this state lasts, the more normal emotional distance can start to feel.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_disengagement: 1.1,
      social_withdrawal: 1.1,
      meaning_erosion: 0.6
    },
    highValueContextMarkers: ["distance_becoming_normalized"]
  }),
  choice({
    id: "edi-return-7",
    sectionId: "edi-reentry",
    prompt: "If a small step back toward fuller engagement did feel possible, the hardest part would be:",
    type: "multiple_choice",
    options: [
      {
        id: "trusting-it-could-build",
        label: "Trusting that it could become something real instead of disappearing again.",
        value: 4,
        dimensionWeights: {
          emotional_disengagement: 2,
          motivational_flattening: 2
        },
        contextMarkers: ["return_hard_to_trust"]
      },
      {
        id: "allowing-care-before-certainty",
        label: "Allowing myself to care before I feel sure the effort will matter.",
        value: 4,
        dimensionWeights: {
          meaning_erosion: 2,
          emotional_disengagement: 1,
          existential_fatigue: 1
        },
        contextMarkers: ["care_before_certainty_is_hard"]
      },
      {
        id: "tolerating-more-exposure",
        label: "Tolerating how exposed I might feel once I am less detached.",
        value: 4,
        dimensionWeights: {
          social_withdrawal: 2,
          emotional_disengagement: 2
        },
        contextMarkers: ["reengagement_feels_exposed"]
      },
      {
        id: "not-main-obstacle",
        label: "Re-entry itself is not the main obstacle once momentum begins.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  })
];

const emotionalDetachmentAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "edi-range",
        title: "Emotional Contact",
        description: "How much of life still feels emotionally reachable from the inside.",
        intent: "Measure muted feeling, inner distance, and reduced emotional registration."
      },
      {
        id: "edi-meaning",
        title: "Meaning and Significance",
        description: "Where personal significance, purpose, or felt investment has thinned out.",
        intent: "Capture the difference between ordinary tiredness and deeper meaning erosion."
      },
      {
        id: "edi-social",
        title: "Relational Distance",
        description: "How the state affects warmth, responsiveness, and ordinary connection with people.",
        intent: "Measure social withdrawal that comes from inner distance rather than simple preference."
      },
      {
        id: "edi-engagement",
        title: "Participation and Pull",
        description: "How daily participation changes when the inner pull toward life goes quiet.",
        intent: "Assess flattening, reduced engagement, and life becoming more mechanical."
      },
      {
        id: "edi-reentry",
        title: "Re-Entry Resistance",
        description: "What happens when part of you wants more connection again.",
        intent: "Measure how difficult it feels to return to fuller emotional involvement."
      }
    ],
    emotionalDetachmentQuestions
  );

  return {
    id: "asm_emotional_detachment_nihilism_insight",
    slug: "emotional-detachment-nihilism-insight",
    topicKey: "emotional_detachment",
    title: "Emotional Detachment / Nihilism Insight",
    subtitle:
      "A measured read on emotional distance, meaning erosion, and the quiet drift away from fuller participation in life.",
    category: "Emotional State",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: emotionalDetachmentQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You may still be functioning outwardly, but life feels emotionally thinner, less meaningful, or farther away from you than it used to.",
    previewPromise:
      "See whether the pattern is being driven most by emotional disengagement, meaning erosion, existential fatigue, social withdrawal, or flattened motivation.",
    reportLabel: "Emotional-state insight report",
    focusAreas: [
      "Emotional contact and inner distance",
      "Meaning fatigue and social withdrawal",
      "Participation, re-entry, and motivational flattening"
    ],
    outcomeHighlights: [
      "Clarify whether the state looks more like shutdown, meaning erosion, or protective withdrawal.",
      "Show where emotional distance is changing participation, relationships, and daily life.",
      "Prepare a more respectful map of re-entry rather than forcing optimism onto the experience."
    ],
    introBullets: [
      "Built for users who feel emotionally farther from life without wanting pathologizing or exaggerated language.",
      "Questions focus on muted feeling, loss of significance, social distance, the reduced pull toward participation, and what makes re-engagement feel hard.",
      "The resulting report is designed to clarify whether the state is more about numbness, meaning fatigue, withdrawal, or a broader flattening of inner life."
    ],
    bundleTags: ["meaning-and-identity", "burnout-and-energy"],
    categoryTags: ["emotional-state", "meaning", "withdrawal"],
    dimensions: emotionalDetachmentDimensions,
    sections,
    questions: emotionalDetachmentQuestions,
    relatedAssessments: [
      related(
        "anhedonia-and-motivation-pattern-scan",
        "Useful if the flatness is showing up as reduced reward response, initiation difficulty, or low internal pull toward action."
      ),
      related(
        "identity-and-inner-conflict-profile",
        "Useful if emotional distance seems tied to role strain, value mismatch, or not feeling fully connected to your own life."
      ),
      related(
        "membership",
        "Membership can later support an evolving insight library across meaning, motivation, identity, and stress patterns.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "emotional-detachment-nihilism-insight",
      title: "Emotional Distance Insight Report",
      subtitle:
        "A premium report for emotional disengagement, meaning erosion, social withdrawal, and re-entry resistance.",
      previewPromises: previewSections(
        "See whether the state is being led more by numbness, meaning fatigue, withdrawal, or a quieter flattening of motivation.",
        "Preview how emotional distance, meaning erosion, and re-engagement resistance appear to be interacting."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the dominant emotional-distance pattern emerging from your responses.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how emotional disengagement, meaning fatigue, withdrawal, and flattening appear to fit together.",
        emotionalDrivers:
          "Premium section on the emotional mechanics, internal fatigue, and protective patterns that may be reinforcing detachment.",
        dailyLifeImpact:
          "Premium section translating the pattern into routines, relationships, participation, and everyday presence.",
        blindSpots:
          "Premium section surfacing subtle ways emotional distance can normalize itself or disguise its own cost.",
        stabilitySuggestions:
          "Premium section for calmer re-entry, more believable reconnection, and steadier internal contact.",
        relatedInsights:
          "Related assessments and bundle paths that make sense after this emotional-distance result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit meaning, motivation, identity, and burnout reports together over time."
  } satisfies AssessmentDefinition;
})();

const anhedoniaDimensions = [
  dimension(
    "reward_sensitivity_loss",
    "Reward Sensitivity Loss",
    "Reward",
    "experiences are giving back less emotional reward than they used to"
  ),
  dimension(
    "anticipation_loss",
    "Anticipation Loss",
    "Anticipation",
    "looking forward to things feels weak, inconsistent, or unusually hard to access"
  ),
  dimension(
    "effort_resistance",
    "Effort Resistance",
    "Effort",
    "starting or engaging effort feels heavier than the task itself should require"
  ),
  dimension(
    "emotional_flattening",
    "Emotional Flattening",
    "Flatness",
    "the emotional lift that usually accompanies activity, novelty, or completion is reduced"
  ),
  dimension(
    "cognitive_disengagement",
    "Cognitive Disengagement",
    "Focus",
    "attention, curiosity, and mental entry into tasks are weakening more quickly than expected"
  )
];

const anhedoniaQuestions = [
  scale({
    id: "amp-anticip-1",
    sectionId: "amp-anticipation",
    prompt:
      "I can know that something is usually enjoyable and still feel very little pull toward it ahead of time.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 1.6
    },
    highValueContextMarkers: ["known_good_has_low_pull"]
  }),
  choice({
    id: "amp-anticip-2",
    sectionId: "amp-anticipation",
    prompt: "When a free block of time opens up, your first reaction is most often:",
    type: "multiple_choice",
    options: [
      {
        id: "something-sounds-good",
        label: "At least one thing sounds genuinely appealing.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "nothing-calls",
        label: "Nothing really calls to me strongly enough to start.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 3,
          effort_resistance: 1
        },
        contextMarkers: ["nothing_calls"]
      },
      {
        id: "too-much-effort",
        label: "Some options sound okay in theory, but the effort feels too high for the payoff.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          reward_sensitivity_loss: 2
        },
        contextMarkers: ["cost_exceeds_expected_return"]
      },
      {
        id: "default-scroll",
        label: "I drift into low-effort distraction because choosing something else feels heavier.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 2,
          anticipation_loss: 1,
          effort_resistance: 1
        },
        contextMarkers: ["low_effort_defaulting"]
      }
    ]
  }),
  scale({
    id: "amp-anticip-3",
    sectionId: "amp-anticipation",
    prompt:
      "Looking forward to something can feel weaker than it used to, even when I know I would probably benefit from it.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 1.4,
      reward_sensitivity_loss: 0.7
    }
  }),
  choice({
    id: "amp-anticip-4",
    sectionId: "amp-anticipation",
    prompt: "Which feels closest to the issue right now?",
    type: "multiple_choice",
    options: [
      {
        id: "hard-to-want",
        label: "It is hard to want things in a way that gets me moving.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 3
        },
        contextMarkers: ["wanting_is_muted"]
      },
      {
        id: "hard-to-start",
        label: "I may want it a little, but getting started feels disproportionately hard.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 3
        },
        contextMarkers: ["starting_is_heavier_than_wanting"]
      },
      {
        id: "hard-to-feel-return",
        label: "Even when I do it, the emotional return feels weaker than expected.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 3
        },
        contextMarkers: ["return_feels_weaker"]
      },
      {
        id: "hard-to-stay-mentally-in",
        label: "My mind has trouble staying engaged long enough for anything to build.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3
        },
        contextMarkers: ["engagement_drops_before_build"]
      }
    ]
  }),
  scale({
    id: "amp-anticip-5",
    sectionId: "amp-anticipation",
    prompt:
      "I still get a fairly natural sense of anticipation when something meaningful is coming up.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "amp-anticip-6",
    sectionId: "amp-anticipation",
    prompt: "When a plan sounds good in theory but you do not act on it, the main reason is usually:",
    type: "situational",
    options: [
      {
        id: "energy-not-there",
        label: "The internal lift never arrives strongly enough to become momentum.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 2,
          effort_resistance: 2
        },
        contextMarkers: ["lift_never_turns_into_momentum"]
      },
      {
        id: "return-uncertain",
        label: "I do not trust the experience will feel worthwhile enough once I am in it.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 2,
          anticipation_loss: 1,
          effort_resistance: 1
        },
        contextMarkers: ["return_is_not_believable"]
      },
      {
        id: "mind-not-entering",
        label: "My mind does not fully enter the idea long enough to carry me there.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 2,
          anticipation_loss: 2
        },
        contextMarkers: ["mind_does_not_enter_plan"]
      },
      {
        id: "mostly-follow-through",
        label: "If something matters, I usually still follow through reasonably well.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "amp-anticip-7",
    sectionId: "amp-anticipation",
    prompt:
      "Even upcoming time off or plans I once would have looked forward to can feel emotionally flat until the last minute, if at all.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 1.3,
      reward_sensitivity_loss: 0.9
    },
    highValueContextMarkers: ["time_off_has_low_anticipation"]
  }),
  scale({
    id: "amp-start-1",
    sectionId: "amp-initiation",
    prompt:
      "Starting even manageable tasks can feel heavier than the task itself seems to justify.",
    scaleKey: "agreement",
    dimensionWeights: {
      effort_resistance: 1.6
    },
    highValueContextMarkers: ["start_cost_is_high"]
  }),
  choice({
    id: "amp-start-2",
    sectionId: "amp-initiation",
    prompt: "When something needs to get done, your pattern is most often:",
    type: "situational",
    options: [
      {
        id: "steady-entry",
        label: "I enter it steadily once I decide to.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "long-ramp-up",
        label: "I circle it for longer than I want before actually starting.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 3,
          cognitive_disengagement: 1
        },
        contextMarkers: ["long_ramp_up"]
      },
      {
        id: "only-under-pressure",
        label: "I often need external pressure before the task becomes enterable.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          anticipation_loss: 1,
          cognitive_disengagement: 1
        },
        contextMarkers: ["pressure_needed_to_start"]
      },
      {
        id: "begin-but-detached",
        label: "I can begin, but I do it in a detached way that never really warms up.",
        value: 4,
        dimensionWeights: {
          emotional_flattening: 2,
          cognitive_disengagement: 2
        },
        contextMarkers: ["started_without_entry"]
      }
    ]
  }),
  scale({
    id: "amp-start-3",
    sectionId: "amp-initiation",
    prompt:
      "The hardest part is often crossing the line from intention into actual movement.",
    scaleKey: "agreement",
    dimensionWeights: {
      effort_resistance: 1.4,
      anticipation_loss: 0.7
    }
  }),
  choice({
    id: "amp-start-4",
    sectionId: "amp-initiation",
    prompt: "What tends to stall you most at the starting point?",
    type: "multiple_choice",
    options: [
      {
        id: "no-spark",
        label: "There is not enough spark or emotional pull to enter it.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 2,
          emotional_flattening: 1,
          effort_resistance: 1
        },
        contextMarkers: ["no_spark_to_enter"]
      },
      {
        id: "too-much-friction",
        label: "The felt friction is too high for something that should be manageable.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 3
        },
        contextMarkers: ["felt_friction_too_high"]
      },
      {
        id: "cannot-focus-in",
        label: "My attention does not lock in cleanly enough to begin with confidence.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3
        },
        contextMarkers: ["focus_will_not_lock_in"]
      },
      {
        id: "return-not-worth-it",
        label: "Part of me does not believe the experience will give enough back.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 2,
          effort_resistance: 2
        },
        contextMarkers: ["starting_not_worth_it"]
      }
    ]
  }),
  scale({
    id: "amp-start-5",
    sectionId: "amp-initiation",
    prompt:
      "Once I decide something matters, I can usually get started without an unusually long internal negotiation.",
    scaleKey: "agreement",
    dimensionWeights: {
      effort_resistance: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "amp-start-6",
    sectionId: "amp-initiation",
    prompt:
      "I can feel irritated with myself for not starting while still being unable to generate real entry.",
    scaleKey: "agreement",
    dimensionWeights: {
      effort_resistance: 1.2,
      cognitive_disengagement: 0.8
    },
    highValueContextMarkers: ["self_awareness_without_entry"]
  }),
  scale({
    id: "amp-start-7",
    sectionId: "amp-initiation",
    prompt:
      "At work or around routine responsibilities, I can spend more time gathering myself to begin than the task should realistically require.",
    scaleKey: "agreement",
    dimensionWeights: {
      effort_resistance: 1.3,
      cognitive_disengagement: 0.8
    },
    highValueContextMarkers: ["routine_tasks_need_gathering"]
  }),
  scale({
    id: "amp-engage-1",
    sectionId: "amp-engagement",
    prompt:
      "Even when I do the activity, the emotional return can feel weaker than the effort it required.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 1.5,
      emotional_flattening: 0.8
    },
    highValueContextMarkers: ["return_below_effort"]
  }),
  choice({
    id: "amp-engage-2",
    sectionId: "amp-engagement",
    prompt: "When an activity goes reasonably well, your reaction is most often:",
    type: "situational",
    options: [
      {
        id: "it-registers",
        label: "I can feel some real satisfaction from it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "fine-but-flat",
        label: "I know it went fine, but the emotional lift barely shows up.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 2,
          emotional_flattening: 2
        },
        contextMarkers: ["completion_without_lift"]
      },
      {
        id: "relief-only",
        label: "Mostly relief that it is done, not much positive return.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 2,
          effort_resistance: 1,
          emotional_flattening: 1
        },
        contextMarkers: ["relief_instead_of_reward"]
      },
      {
        id: "mind-already-gone",
        label: "My mind has already disengaged before the positive part can land.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 2,
          reward_sensitivity_loss: 1,
          emotional_flattening: 1
        },
        contextMarkers: ["mind_leaves_before_reward"]
      }
    ]
  }),
  scale({
    id: "amp-engage-3",
    sectionId: "amp-engagement",
    prompt:
      "Pleasure, interest, or satisfaction often arrives in smaller amounts than I expect from things I know I used to enjoy.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 1.6
    }
  }),
  choice({
    id: "amp-engage-4",
    sectionId: "amp-engagement",
    prompt: "The state shows up most clearly once you are already in something when:",
    type: "multiple_choice",
    options: [
      {
        id: "attention-drops",
        label: "Your attention drops before the activity has time to become engaging.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3
        },
        contextMarkers: ["attention_drops_early"]
      },
      {
        id: "feeling-does-not-build",
        label: "The emotional payoff never really builds even when the activity is fine.",
        value: 4,
        dimensionWeights: {
          emotional_flattening: 2,
          reward_sensitivity_loss: 2
        },
        contextMarkers: ["payoff_does_not_build"]
      },
      {
        id: "urge-to-stop",
        label: "You start wanting to stop because the cost feels out of proportion to the return.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          reward_sensitivity_loss: 2
        },
        contextMarkers: ["cost_outweighs_return_midstream"]
      },
      {
        id: "mostly-stays-with-me",
        label: "Once I am in it, I usually stay with it reasonably well.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "amp-engage-5",
    sectionId: "amp-engagement",
    prompt:
      "Moments that should feel rewarding can register as neutral more often than they used to.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_flattening: 1.2,
      reward_sensitivity_loss: 1.2
    }
  }),
  scale({
    id: "amp-engage-6",
    sectionId: "amp-engagement",
    prompt:
      "If I make it into the activity, some natural interest or enjoyment usually begins to build on its own.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 1.3,
      emotional_flattening: 1
    },
    reverseScored: true
  }),
  scale({
    id: "amp-engage-7",
    sectionId: "amp-engagement",
    prompt:
      "Novelty helps less than it used to because even new experiences can flatten quickly once I am in them.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 1.1,
      emotional_flattening: 1.1
    },
    highValueContextMarkers: ["novelty_flattens_quickly"]
  }),
  scale({
    id: "amp-focus-1",
    sectionId: "amp-focus",
    prompt:
      "My mind can drift out of tasks or experiences before they have a chance to become absorbing.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_disengagement: 1.6
    },
    highValueContextMarkers: ["absorption_does_not_form"]
  }),
  choice({
    id: "amp-focus-2",
    sectionId: "amp-focus",
    prompt: "When your attention slips, it is usually because:",
    type: "multiple_choice",
    options: [
      {
        id: "nothing-grabs",
        label: "Nothing in the moment feels gripping enough to hold me.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 2,
          reward_sensitivity_loss: 1,
          anticipation_loss: 1
        },
        contextMarkers: ["nothing_grips_attention"]
      },
      {
        id: "brain-feels-dull",
        label: "My mind feels dull or slower to enter than I want it to.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3,
          emotional_flattening: 1
        },
        contextMarkers: ["mind_feels_dull"]
      },
      {
        id: "too-much-cost",
        label: "Staying with it feels too effortful for the reward I expect.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          cognitive_disengagement: 2
        },
        contextMarkers: ["staying_with_it_costs_too_much"]
      },
      {
        id: "attention-mostly-fine",
        label: "Attention is not usually the main part of the problem for me.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "amp-focus-3",
    sectionId: "amp-focus",
    prompt:
      "Curiosity can fade before it has a chance to organize my attention into real engagement.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_disengagement: 1.4,
      anticipation_loss: 0.8
    }
  }),
  choice({
    id: "amp-focus-4",
    sectionId: "amp-focus",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "mind-engages-once-begun",
        label: "If I begin, my mind can usually engage enough to carry me forward.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "mind-keeps-slipping",
        label: "Even after I begin, my mind keeps slipping away before anything can really build.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3,
          emotional_flattening: 1
        },
        contextMarkers: ["mind_slips_even_after_start"]
      }
    ]
  }),
  scale({
    id: "amp-focus-5",
    sectionId: "amp-focus",
    prompt:
      "Mental disengagement can be as limiting as low mood because it prevents anything from becoming vivid enough to matter.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_disengagement: 1.2,
      reward_sensitivity_loss: 0.8,
      emotional_flattening: 0.6
    }
  }),
  scale({
    id: "amp-focus-6",
    sectionId: "amp-focus",
    prompt:
      "I can still get mentally absorbed in things often enough that low engagement does not feel like a broader pattern.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_disengagement: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "amp-focus-7",
    sectionId: "amp-focus",
    prompt: "When focus drops mid-task, the experience is usually closer to:",
    type: "situational",
    options: [
      {
        id: "recoverable-distraction",
        label: "Normal distraction that I can recover from fairly quickly.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "nothing-is-grabbing",
        label: "My mind slides off because nothing inside the task is gripping enough to hold it.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3,
          reward_sensitivity_loss: 1
        },
        contextMarkers: ["task_not_gripping_enough"]
      },
      {
        id: "re-entering-feels-costly",
        label: "Re-entering feels too effortful once my attention slips.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          cognitive_disengagement: 2
        },
        contextMarkers: ["reentry_cost_after_focus_drop"]
      },
      {
        id: "externally-there-not-in-it",
        label: "I can stay there externally while not feeling mentally invested anymore.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 2,
          emotional_flattening: 1,
          reward_sensitivity_loss: 1
        },
        contextMarkers: ["externally_present_not_invested"]
      }
    ]
  }),
  scale({
    id: "amp-reset-1",
    sectionId: "amp-recovery",
    prompt:
      "Rest does not reliably restore the sense of pull or interest I would expect it to.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 0.8,
      anticipation_loss: 0.8,
      emotional_flattening: 0.9
    }
  }),
  choice({
    id: "amp-reset-2",
    sectionId: "amp-recovery",
    prompt: "After you stop doing something draining, the most common problem is:",
    type: "multiple_choice",
    options: [
      {
        id: "still-flat",
        label: "The flatness remains, so recovery does not turn back into interest.",
        value: 4,
        dimensionWeights: {
          emotional_flattening: 2,
          reward_sensitivity_loss: 2
        },
        contextMarkers: ["recovery_without_return"]
      },
      {
        id: "hard-to-restart",
        label: "It is hard to restart anything because the internal ignition stays low.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 2,
          effort_resistance: 2
        },
        contextMarkers: ["post_rest_no_restart"]
      },
      {
        id: "mind-stays-unfocused",
        label: "My attention still feels loose or uncommitted even after I pause.",
        value: 4,
        dimensionWeights: {
          cognitive_disengagement: 3,
          effort_resistance: 1
        },
        contextMarkers: ["pause_does_not_restore_focus"]
      },
      {
        id: "rest-usually-helps",
        label: "Rest usually helps enough that I can re-enter fairly normally.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "amp-reset-3",
    sectionId: "amp-recovery",
    prompt:
      "The state feels less like sadness and more like reduced access to interest, reward, or momentum.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 0.9,
      anticipation_loss: 0.9,
      emotional_flattening: 0.9,
      effort_resistance: 0.6
    },
    highValueContextMarkers: ["reduced_access_not_just_low_mood"]
  }),
  choice({
    id: "amp-reset-4",
    sectionId: "amp-recovery",
    prompt: "If a little motivation does appear, it is most likely to:",
    type: "situational",
    options: [
      {
        id: "grow-once-used",
        label: "Grow once I start using it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "fade-fast",
        label: "Fade before it becomes real momentum.",
        value: 4,
        dimensionWeights: {
          anticipation_loss: 2,
          cognitive_disengagement: 1,
          effort_resistance: 1
        },
        contextMarkers: ["motivation_fades_fast"]
      },
      {
        id: "not-feel-worth-following",
        label: "Feel too small to trust or follow seriously.",
        value: 4,
        dimensionWeights: {
          reward_sensitivity_loss: 2,
          anticipation_loss: 2
        },
        contextMarkers: ["motivation_too_small_to_trust"]
      },
      {
        id: "run-into-friction",
        label: "Run quickly into friction once real effort is required.",
        value: 4,
        dimensionWeights: {
          effort_resistance: 2,
          cognitive_disengagement: 2
        },
        contextMarkers: ["motivation_hits_friction"]
      }
    ]
  }),
  scale({
    id: "amp-reset-5",
    sectionId: "amp-recovery",
    prompt:
      "I still trust that enjoyment, interest, and follow-through can return in a believable way once the conditions are right.",
    scaleKey: "agreement",
    dimensionWeights: {
      reward_sensitivity_loss: 0.8,
      anticipation_loss: 0.8,
      emotional_flattening: 0.8
    },
    reverseScored: true
  }),
  scale({
    id: "amp-reset-6",
    sectionId: "amp-recovery",
    prompt:
      "The hardest part is not only having less energy, but having less conviction that the next step will feel worth it.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 1.1,
      reward_sensitivity_loss: 1.1,
      effort_resistance: 0.8
    },
    highValueContextMarkers: ["worth_it_signal_is_low"]
  }),
  scale({
    id: "amp-reset-7",
    sectionId: "amp-recovery",
    prompt:
      "A better day can still be hard to trust because the underlying loss of pull returns so easily.",
    scaleKey: "agreement",
    dimensionWeights: {
      anticipation_loss: 0.9,
      reward_sensitivity_loss: 0.9,
      emotional_flattening: 0.8
    },
    highValueContextMarkers: ["better_day_hard_to_trust"]
  })
];

const anhedoniaAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "amp-anticipation",
        title: "Anticipation and Pull",
        description: "How much real internal pull still exists before an activity or moment begins.",
        intent: "Measure reduced anticipation, low wanting, and weak emotional ignition."
      },
      {
        id: "amp-initiation",
        title: "Initiation Friction",
        description: "What happens at the moment when intention is supposed to become movement.",
        intent: "Capture effort resistance, delayed starts, and stalled entry."
      },
      {
        id: "amp-engagement",
        title: "Reward and Emotional Return",
        description: "How much an experience actually gives back once you are in it.",
        intent: "Assess reward loss, flattened return, and low satisfaction."
      },
      {
        id: "amp-focus",
        title: "Cognitive Entry and Focus",
        description: "How easily your attention, curiosity, and mental presence can lock into something.",
        intent: "Measure cognitive disengagement that limits momentum and absorption."
      },
      {
        id: "amp-recovery",
        title: "Reset and Re-Entry",
        description: "What happens after rest, pauses, or brief returns of motivation.",
        intent: "Assess whether motivation can rebuild or keeps fading before it stabilizes."
      }
    ],
    anhedoniaQuestions
  );

  return {
    id: "asm_anhedonia_motivation_pattern_scan",
    slug: "anhedonia-and-motivation-pattern-scan",
    topicKey: "anhedonia_motivation",
    title: "Anhedonia & Motivation Pattern Scan",
    subtitle:
      "A deeper scan for reduced reward, stalled anticipation, effort resistance, and the fading pull toward ordinary life.",
    category: "Motivation",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: anhedoniaQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You may still be getting through responsibilities, but interest, enjoyment, and momentum feel weaker or harder to access than they used to.",
    previewPromise:
      "See whether the strongest issue is reduced reward, low anticipation, effort resistance, emotional flattening, or cognitive disengagement.",
    reportLabel: "Motivation-pattern insight report",
    focusAreas: [
      "Anticipation and wanting",
      "Reward response and emotional return",
      "Effort resistance and cognitive disengagement"
    ],
    outcomeHighlights: [
      "Separate low motivation from the more specific mechanics of reward loss and slowed internal pull.",
      "Show whether the state is driven more by low wanting, heavy starts, weak payoff, or unstable engagement.",
      "Prepare stronger report foundations around daily function, stability, and rebuild conditions."
    ],
    introBullets: [
      "Built as a serious motivation and reward assessment rather than a productivity quiz.",
      "Questions focus on anticipation, entry friction, emotional return, attention loss, and whether rest actually restores the ability to re-engage.",
      "The resulting report is designed to clarify where the experience is breaking down: before action, during action, after action, or across the whole motivation cycle."
    ],
    bundleTags: ["burnout-and-energy", "meaning-and-identity"],
    categoryTags: ["motivation", "energy", "daily-functioning"],
    dimensions: anhedoniaDimensions,
    sections,
    questions: anhedoniaQuestions,
    relatedAssessments: [
      related(
        "emotional-detachment-nihilism-insight",
        "Useful if low motivation feels tied to emotional distance, loss of meaning, or withdrawal from life more broadly."
      ),
      related(
        "personality-burnout-and-stress-report",
        "Useful if depletion, overfunctioning, and blocked recovery appear to be driving the loss of momentum.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later connect motivation, burnout, identity, and mood-pattern reports in one private library.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "anhedonia-and-motivation-pattern-scan",
      title: "Motivation Pattern Insight Report",
      subtitle:
        "A premium report for reduced reward response, low anticipation, effort resistance, and unstable engagement.",
      previewPromises: previewSections(
        "See whether the strongest issue appears before action, during effort, after completion, or across the whole motivation cycle.",
        "Preview how anticipation loss, reward flattening, and start-up friction appear to be combining."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on where the motivation cycle is weakening most clearly right now.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how wanting, effort, reward, and attention are interacting in your result.",
        emotionalDrivers:
          "Premium section on internal pull, expected return, effort cost, and the emotional mechanics under low motivation.",
        dailyLifeImpact:
          "Premium section translating the pattern into routines, work, follow-through, and ordinary life entry.",
        blindSpots:
          "Premium section surfacing hidden assumptions, false starts, and the subtle costs of low reward and low conviction.",
        stabilitySuggestions:
          "Premium section for calmer rebuild conditions, realistic pacing, and steadier re-entry into action.",
        relatedInsights:
          "Related assessments and bundle paths that make sense after this motivation-pattern result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit motivation, burnout, meaning, and identity patterns together."
  } satisfies AssessmentDefinition;
})();

const burnoutDimensions = [
  dimension(
    "sustained_pressure",
    "Sustained Pressure",
    "Pressure",
    "your system is carrying a near-continuous sense of demand with too little real drop-off"
  ),
  dimension(
    "recovery_difficulty",
    "Recovery Difficulty",
    "Recovery",
    "rest is happening, but genuine reset is still not landing the way it should"
  ),
  dimension(
    "cognitive_overload",
    "Cognitive Overload",
    "Overload",
    "mental bandwidth is being crowded by constant tracking, switching, or unfinished load"
  ),
  dimension(
    "emotional_depletion",
    "Emotional Depletion",
    "Depletion",
    "patience, emotional availability, or inner reserve feels drained more quickly than before"
  ),
  dimension(
    "performance_strain",
    "Performance Strain",
    "Performance",
    "self-worth and safety are becoming too tightly tied to staying capable, useful, and on top of things"
  )
];

const burnoutQuestions = [
  scale({
    id: "bsr-load-1",
    sectionId: "bsr-load",
    prompt:
      "Even after I finish what was urgent, my system stays braced as if the next demand is already on its way.",
    scaleKey: "agreement",
    dimensionWeights: {
      sustained_pressure: 1.6
    },
    highValueContextMarkers: ["system_stays_braced"]
  }),
  choice({
    id: "bsr-load-2",
    sectionId: "bsr-load",
    prompt: "When someone asks for one more thing from you, your first internal reaction is usually:",
    type: "situational",
    options: [
      {
        id: "assess-it-steadily",
        label: "I assess it fairly steadily and decide what I can realistically do.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "instant-tightening",
        label: "A quick internal tightening because there was no real slack left to begin with.",
        value: 4,
        dimensionWeights: {
          sustained_pressure: 3,
          emotional_depletion: 1
        },
        contextMarkers: ["no_slack_left"]
      },
      {
        id: "say-yes-anyway",
        label: "I feel the strain, but I still lean toward saying yes so things do not slip.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          sustained_pressure: 1,
          emotional_depletion: 1
        },
        contextMarkers: ["yes_despite_strain"]
      },
      {
        id: "mind-starts-spinning",
        label: "My mind immediately starts calculating how it will affect everything else.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 2,
          sustained_pressure: 2
        },
        contextMarkers: ["new_request_triggers_load_math"]
      }
    ]
  }),
  scale({
    id: "bsr-load-3",
    sectionId: "bsr-load",
    prompt:
      "My responsibilities feel demanding, but still contained enough that I can come fully off-duty at least part of the time.",
    scaleKey: "agreement",
    dimensionWeights: {
      sustained_pressure: 1.5,
      recovery_difficulty: 0.7
    },
    reverseScored: true
  }),
  choice({
    id: "bsr-load-4",
    sectionId: "bsr-load",
    prompt: "The load feels heaviest because:",
    type: "multiple_choice",
    options: [
      {
        id: "always-on-call",
        label: "There is no real psychological off-switch even when I am technically done.",
        value: 4,
        dimensionWeights: {
          sustained_pressure: 3
        },
        contextMarkers: ["no_psychological_off_switch"]
      },
      {
        id: "invisible-weight",
        label: "I carry a lot of invisible tracking, coordination, or emotional labor other people do not see.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 2,
          emotional_depletion: 1,
          sustained_pressure: 1
        },
        contextMarkers: ["invisible_load"]
      },
      {
        id: "cannot-drop-standard",
        label: "I do not feel free to lower the standard without feeling unsafe or irresponsible.",
        value: 4,
        dimensionWeights: {
          performance_strain: 3,
          sustained_pressure: 1
        },
        contextMarkers: ["standard_cannot_drop"]
      },
      {
        id: "always-catch-up",
        label: "I feel as if I am always recovering from yesterday while trying to stay ahead of tomorrow.",
        value: 4,
        dimensionWeights: {
          sustained_pressure: 2,
          recovery_difficulty: 2
        },
        contextMarkers: ["never_caught_up"]
      }
    ]
  }),
  scale({
    id: "bsr-load-5",
    sectionId: "bsr-load",
    prompt:
      "I often keep functioning past clear signs that I need recovery because there does not seem to be a clean place to stop.",
    scaleKey: "agreement",
    dimensionWeights: {
      sustained_pressure: 1.2,
      recovery_difficulty: 1,
      performance_strain: 0.6
    },
    highValueContextMarkers: ["functioning_past_limits"]
  }),
  choice({
    id: "bsr-load-6",
    sectionId: "bsr-load",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "pressure-comes-and-goes",
        label: "The pressure rises and falls, but I still get real intervals of internal release.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "pressure-has-residency",
        label: "The pressure has started to feel like a standing condition rather than a temporary season.",
        value: 4,
        dimensionWeights: {
          sustained_pressure: 3,
          recovery_difficulty: 1
        },
        contextMarkers: ["pressure_feels_constant"]
      }
    ]
  }),
  scale({
    id: "bsr-load-7",
    sectionId: "bsr-load",
    prompt:
      "Even ordinary requests can land like additions to an already overdrawn system.",
    scaleKey: "agreement",
    dimensionWeights: {
      sustained_pressure: 1.4,
      emotional_depletion: 0.8
    },
    highValueContextMarkers: ["system_overdrawn"]
  }),
  scale({
    id: "bsr-cog-1",
    sectionId: "bsr-cognitive",
    prompt:
      "My mind keeps tracking unfinished details even when I am trying to focus on only one thing.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_overload: 1.6
    },
    highValueContextMarkers: ["unfinished_tracking_persists"]
  }),
  choice({
    id: "bsr-cog-2",
    sectionId: "bsr-cognitive",
    prompt: "When you try to concentrate, the hardest part is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "too-many-open-tabs",
        label: "Too many active concerns are still running in the background.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 3
        },
        contextMarkers: ["too_many_background_processes"]
      },
      {
        id: "tired-brain",
        label: "My brain feels tired enough that depth is harder to hold.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 2,
          recovery_difficulty: 1,
          emotional_depletion: 1
        },
        contextMarkers: ["depth_harder_to_hold"]
      },
      {
        id: "fear-missing-something",
        label: "Part of me keeps scanning for what I might be forgetting or overlooking.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          cognitive_overload: 2
        },
        contextMarkers: ["scanning_for_missed_items"]
      },
      {
        id: "concentration-mostly-ok",
        label: "Concentration is not the main place the strain shows up.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "bsr-cog-3",
    sectionId: "bsr-cognitive",
    prompt:
      "Task-switching, remembering, and holding details together now costs more effort than it used to.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_overload: 1.5,
      recovery_difficulty: 0.5
    }
  }),
  choice({
    id: "bsr-cog-4",
    sectionId: "bsr-cognitive",
    prompt: "When something small goes wrong, your mind most often does what?",
    type: "situational",
    options: [
      {
        id: "respond-and-move-on",
        label: "Responds and moves on without much residual spin.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "expands-the-load",
        label: "Immediately expands it into everything else that also needs attention.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 3,
          sustained_pressure: 1
        },
        contextMarkers: ["small_issue_expands_whole_load"]
      },
      {
        id: "self-blame-loop",
        label: "Turns into a self-critical review of whether I should have prevented it.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          cognitive_overload: 2
        },
        contextMarkers: ["error_becomes_self_review"]
      },
      {
        id: "shut-down-briefly",
        label: "Creates a brief mental freeze because there was no spare bandwidth left.",
        value: 4,
        dimensionWeights: {
          cognitive_overload: 2,
          emotional_depletion: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["no_bandwidth_for_disruption"]
      }
    ]
  }),
  scale({
    id: "bsr-cog-5",
    sectionId: "bsr-cognitive",
    prompt:
      "I can usually keep one problem in proportion without my mind immediately pulling in five others.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_overload: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "bsr-cog-6",
    sectionId: "bsr-cognitive",
    prompt:
      "Mental clutter now affects my confidence because I no longer trust my internal bandwidth the way I used to.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_overload: 1.1,
      performance_strain: 0.9
    },
    highValueContextMarkers: ["bandwidth_self_trust_drop"]
  }),
  scale({
    id: "bsr-cog-7",
    sectionId: "bsr-cognitive",
    prompt:
      "I leave more reminders, lists, or safety checks for myself because I trust my bandwidth less than I used to.",
    scaleKey: "agreement",
    dimensionWeights: {
      cognitive_overload: 1.3,
      performance_strain: 0.9
    },
    highValueContextMarkers: ["outsourcing_memory_for_safety"]
  }),
  scale({
    id: "bsr-em-1",
    sectionId: "bsr-emotional",
    prompt:
      "My patience, warmth, or emotional flexibility runs out faster than it used to.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_depletion: 1.6
    },
    highValueContextMarkers: ["patience_runs_out_faster"]
  }),
  choice({
    id: "bsr-em-2",
    sectionId: "bsr-emotional",
    prompt: "The emotional cost shows up most clearly when:",
    type: "multiple_choice",
    options: [
      {
        id: "small-needs-feel-big",
        label: "Small needs from other people can feel larger than they objectively are.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 3
        },
        contextMarkers: ["small_needs_feel_large"]
      },
      {
        id: "joy-does-not-land",
        label: "Good moments arrive, but I do not have much emotional room to meet them.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 2,
          recovery_difficulty: 1,
          sustained_pressure: 1
        },
        contextMarkers: ["little_room_for_good_moments"]
      },
      {
        id: "care-feels-performative",
        label: "I am still showing up, but the caring can feel more performed than fully felt.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 2,
          performance_strain: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["care_feels_performed"]
      },
      {
        id: "irritation-arrives-fast",
        label: "I move from composed to irritated much faster than I want to.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 2,
          sustained_pressure: 1,
          cognitive_overload: 1
        },
        contextMarkers: ["irritation_threshold_lower"]
      }
    ]
  }),
  scale({
    id: "bsr-em-3",
    sectionId: "bsr-emotional",
    prompt:
      "I sometimes feel emotionally thinner than I look from the outside because functioning is covering the depletion.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_depletion: 1.4,
      performance_strain: 0.7
    },
    highValueContextMarkers: ["functioning_masks_depletion"]
  }),
  choice({
    id: "bsr-em-4",
    sectionId: "bsr-emotional",
    prompt: "After an emotionally demanding day, your most common response is:",
    type: "situational",
    options: [
      {
        id: "recover-gradually",
        label: "I gradually recover once the day is over.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "go-blank",
        label: "I go emotionally blank because there is nothing left to extend.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 3,
          recovery_difficulty: 1
        },
        contextMarkers: ["emotional_blank_after_day"]
      },
      {
        id: "stay-irritable",
        label: "I stay more irritable or brittle than the situation alone would explain.",
        value: 4,
        dimensionWeights: {
          emotional_depletion: 2,
          sustained_pressure: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["brittleness_lingers"]
      },
      {
        id: "feel-guilty-for-needing-space",
        label: "I feel guilty for needing space because other people still need things from me.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          emotional_depletion: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["guilt_for_needing_space"]
      }
    ]
  }),
  scale({
    id: "bsr-em-5",
    sectionId: "bsr-emotional",
    prompt:
      "My emotional reserve now feels more easily spent, even in areas of life I still care about.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_depletion: 1.5
    }
  }),
  scale({
    id: "bsr-em-6",
    sectionId: "bsr-emotional",
    prompt:
      "Even under pressure, I usually still have enough emotional margin to be patient, responsive, and flexible.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_depletion: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "bsr-em-7",
    sectionId: "bsr-emotional",
    prompt:
      "I can keep being dependable while quietly feeling more brittle, resentful, or emotionally unavailable underneath it.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_depletion: 1.2,
      performance_strain: 0.8,
      recovery_difficulty: 0.5
    },
    highValueContextMarkers: ["dependable_but_brittle"]
  }),
  scale({
    id: "bsr-rec-1",
    sectionId: "bsr-recovery",
    prompt:
      "Rest happens, but it does not reliably turn back into actual restoration.",
    scaleKey: "agreement",
    dimensionWeights: {
      recovery_difficulty: 1.6
    },
    highValueContextMarkers: ["rest_without_restoration"]
  }),
  choice({
    id: "bsr-rec-2",
    sectionId: "bsr-recovery",
    prompt: "When you finally get downtime, your system most often does what?",
    type: "multiple_choice",
    options: [
      {
        id: "settles-gradually",
        label: "Settles gradually enough that the rest actually counts.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "keeps-running",
        label: "Keeps mentally running through what is next or what was missed.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          cognitive_overload: 2
        },
        contextMarkers: ["rest_with_mental_running"]
      },
      {
        id: "crash-only",
        label: "Collapses into exhaustion without much true renewal.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 3,
          emotional_depletion: 1
        },
        contextMarkers: ["downtime_is_only_crash"]
      },
      {
        id: "feel-guilty-resting",
        label: "Feels guilty or uneasy resting because there is too much left undone.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          recovery_difficulty: 2
        },
        contextMarkers: ["rest_guilt"]
      }
    ]
  }),
  scale({
    id: "bsr-rec-3",
    sectionId: "bsr-recovery",
    prompt:
      "Sleep, time off, or quiet periods help somewhat, but the underlying strain returns too quickly.",
    scaleKey: "agreement",
    dimensionWeights: {
      recovery_difficulty: 1.4,
      sustained_pressure: 0.8
    }
  }),
  choice({
    id: "bsr-rec-4",
    sectionId: "bsr-recovery",
    prompt: "What most often blocks recovery from becoming real?",
    type: "multiple_choice",
    options: [
      {
        id: "cannot-turn-off",
        label: "My mind does not fully turn off when the work stops.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          cognitive_overload: 2
        },
        contextMarkers: ["mind_cannot_turn_off"]
      },
      {
        id: "pressure-returns-fast",
        label: "The next demand arrives before the reset has a chance to land.",
        value: 4,
        dimensionWeights: {
          sustained_pressure: 2,
          recovery_difficulty: 2
        },
        contextMarkers: ["next_demand_arrives_too_fast"]
      },
      {
        id: "do-not-allow-enough",
        label: "I do not really allow myself enough recovery unless something forces it.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          recovery_difficulty: 2
        },
        contextMarkers: ["recovery_not_permitted"]
      },
      {
        id: "body-rests-mind-not",
        label: "My body rests more than my emotional system does.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          emotional_depletion: 2
        },
        contextMarkers: ["body_rest_mind_not"]
      }
    ]
  }),
  scale({
    id: "bsr-rec-5",
    sectionId: "bsr-recovery",
    prompt:
      "I can usually sense when recovery is genuinely landing, not just when I have paused for a while.",
    scaleKey: "agreement",
    dimensionWeights: {
      recovery_difficulty: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "bsr-rec-6",
    sectionId: "bsr-recovery",
    prompt:
      "Part of the burnout comes from how little true reset my system now seems able to accept.",
    scaleKey: "agreement",
    dimensionWeights: {
      recovery_difficulty: 1.3,
      sustained_pressure: 0.7
    },
    highValueContextMarkers: ["system_struggles_to_accept_reset"]
  }),
  choice({
    id: "bsr-rec-7",
    sectionId: "bsr-recovery",
    prompt: "On a day off, the hardest part is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "letting-day-be-day-off",
        label: "Letting the day stay restorative instead of quietly turning it into catch-up time.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          performance_strain: 2
        },
        contextMarkers: ["day_off_turns_into_catch_up"]
      },
      {
        id: "keeping-work-thoughts-out",
        label: "Keeping work or responsibility thoughts from regaining control of the day.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          cognitive_overload: 2
        },
        contextMarkers: ["rest_day_still_cognitively_occupied"]
      },
      {
        id: "finding-restorative-energy",
        label: "Finding enough energy to do something genuinely restorative rather than only collapse.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          emotional_depletion: 1,
          sustained_pressure: 1
        },
        contextMarkers: ["day_off_becomes_only_collapse"]
      },
      {
        id: "days-off-help",
        label: "Days off usually help more than they hurt.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "bsr-stand-1",
    sectionId: "bsr-standards",
    prompt:
      "It feels risky to lower my standard, even when I can see that the current pace is costing me too much.",
    scaleKey: "agreement",
    dimensionWeights: {
      performance_strain: 1.6
    },
    highValueContextMarkers: ["lowering_standard_feels_risky"]
  }),
  choice({
    id: "bsr-stand-2",
    sectionId: "bsr-standards",
    prompt: "The standard feels hard to release because:",
    type: "multiple_choice",
    options: [
      {
        id: "identity-built-on-it",
        label: "Being capable or dependable is part of how I know who I am.",
        value: 4,
        dimensionWeights: {
          performance_strain: 3
        },
        contextMarkers: ["identity_built_on_usefulness"]
      },
      {
        id: "things-fall-apart",
        label: "I worry things will noticeably slip if I stop carrying as much.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          sustained_pressure: 1,
          cognitive_overload: 1
        },
        contextMarkers: ["things_will_fall_apart"]
      },
      {
        id: "respect-might-change",
        label: "I worry other people's trust or respect would change if I showed more limit.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          emotional_depletion: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["respect_depends_on_output"]
      },
      {
        id: "do-not-know-how-to-stop",
        label: "I no longer know how to do it differently without feeling unsettled.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          sustained_pressure: 1,
          recovery_difficulty: 1
        },
        contextMarkers: ["overfunctioning_has_become_normal"]
      }
    ]
  }),
  scale({
    id: "bsr-stand-3",
    sectionId: "bsr-standards",
    prompt:
      "A meaningful part of my stress comes from the pressure to remain the steady one, not only from the work itself.",
    scaleKey: "agreement",
    dimensionWeights: {
      performance_strain: 1.4,
      sustained_pressure: 0.8
    }
  }),
  choice({
    id: "bsr-stand-4",
    sectionId: "bsr-standards",
    prompt: "If you did slightly less for one week, the hardest part would probably be:",
    type: "situational",
    options: [
      {
        id: "tolerate-discomfort",
        label: "Tolerating the discomfort of not overmanaging everything.",
        value: 4,
        dimensionWeights: {
          performance_strain: 2,
          sustained_pressure: 1,
          cognitive_overload: 1
        },
        contextMarkers: ["reduced_overmanagement_feels_unsettling"]
      },
      {
        id: "rest-actually-landing",
        label: "Letting recovery land without immediately filling the space.",
        value: 4,
        dimensionWeights: {
          recovery_difficulty: 2,
          performance_strain: 2
        },
        contextMarkers: ["space_gets_filled_again"]
      },
      {
        id: "others-reaction",
        label: "Managing what other people might expect or notice.",
        value: 4,
        dimensionWeights: {
          performance_strain: 3,
          emotional_depletion: 1
        },
        contextMarkers: ["others_expect_constant_capacity"]
      },
      {
        id: "less-hard-than-expected",
        label: "It might be an adjustment, but not especially hard.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "bsr-stand-5",
    sectionId: "bsr-standards",
    prompt:
      "I can remain competent without feeling that my worth is riding on uninterrupted performance.",
    scaleKey: "agreement",
    dimensionWeights: {
      performance_strain: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "bsr-stand-6",
    sectionId: "bsr-standards",
    prompt:
      "The burnout is partly about what I carry and partly about the private rules I keep using to carry it.",
    scaleKey: "agreement",
    dimensionWeights: {
      performance_strain: 1.1,
      sustained_pressure: 0.8,
      recovery_difficulty: 0.6
    },
    highValueContextMarkers: ["private_rules_drive_burnout"]
  }),
  scale({
    id: "bsr-stand-7",
    sectionId: "bsr-standards",
    prompt:
      "If I am not handling things well, I worry other people will see more instability than I want them to.",
    scaleKey: "agreement",
    dimensionWeights: {
      performance_strain: 1.4,
      emotional_depletion: 0.6
    },
    highValueContextMarkers: ["being_seen_as_less_steady"]
  })
];

const burnoutAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "bsr-load",
        title: "Chronic Load Pattern",
        description: "How pressure has shifted from periodic strain into something more constant.",
        intent: "Measure sustained pressure, overextension, and the sense that there is never real slack."
      },
      {
        id: "bsr-cognitive",
        title: "Cognitive Overload",
        description: "How unfinished load, vigilance, and tracking are affecting mental bandwidth.",
        intent: "Capture the mental mechanics of burnout beyond simple busyness."
      },
      {
        id: "bsr-emotional",
        title: "Emotional Depletion",
        description: "How the strain is changing patience, responsiveness, and emotional reserve.",
        intent: "Measure what is being drained internally even while functioning continues."
      },
      {
        id: "bsr-recovery",
        title: "Recovery and Reset",
        description: "What happens when you try to rest, pause, or come off duty.",
        intent: "Assess why rest is not fully converting into restoration."
      },
      {
        id: "bsr-standards",
        title: "Standards and Identity Pressure",
        description: "How personal rules, usefulness, and self-worth may be intensifying the strain.",
        intent: "Measure whether overfunctioning is being driven by identity and performance pressure."
      }
    ],
    burnoutQuestions
  );

  return {
    id: "asm_personality_burnout_stress_report",
    slug: "personality-burnout-and-stress-report",
    topicKey: "burnout_stress",
    title: "Personality Burnout & Stress Report",
    subtitle:
      "A high-context assessment for chronic pressure, blocked recovery, invisible load, and the private rules that keep burnout in place.",
    category: "Burnout",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: burnoutQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "Stress no longer feels like a short-term spike. The way you carry responsibility, self-worth, and invisible load may now be part of the burnout itself.",
    previewPromise:
      "See whether the strongest pressure is coming from chronic load, blocked recovery, cognitive overload, emotional depletion, or performance strain.",
    reportLabel: "Burnout-pattern insight report",
    focusAreas: [
      "Sustained pressure and invisible load",
      "Recovery difficulty and cognitive overload",
      "Emotional depletion and performance pressure"
    ],
    outcomeHighlights: [
      "Separate ordinary busyness from a more personality-shaped burnout pattern.",
      "Show whether the core issue is endless pressure, poor recovery, mental overload, or a self-worth loop around performance.",
      "Prepare future report guidance around reducing strain without collapsing standards or identity."
    ],
    introBullets: [
      "Built for users whose burnout feels tied not only to workload, but also to how they carry responsibility, steadiness, and usefulness.",
      "Questions focus on pressure that never fully drops, mental tracking that keeps running, emotional thinning, blocked recovery, and the private standard that remains hard to lower.",
      "The resulting report is designed to clarify what is actually driving the burnout and why more effort or better time management may not be enough."
    ],
    bundleTags: ["burnout-and-energy", "self-perception"],
    categoryTags: ["burnout", "stress", "performance"],
    dimensions: burnoutDimensions,
    sections,
    questions: burnoutQuestions,
    relatedAssessments: [
      related(
        "imposter-syndrome-deep-report",
        "Useful if much of the strain is coming from private competence pressure, exposure sensitivity, or the need to keep proving yourself."
      ),
      related(
        "anhedonia-and-motivation-pattern-scan",
        "Useful if burnout is now showing up as low reward, low pull, or difficulty restarting life outside obligation.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later connect burnout, motivation, identity, and performance-pattern reports into one ongoing library.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "personality-burnout-and-stress-report",
      title: "Burnout Pattern Insight Report",
      subtitle:
        "A premium report for sustained pressure, cognitive overload, blocked recovery, and identity-linked strain.",
      previewPromises: previewSections(
        "See whether the strain is being driven most by chronic pressure, blocked recovery, overload, depletion, or performance-based self-pressure.",
        "Preview how invisible load, mental bandwidth strain, and burnout-style recovery patterns appear to be fitting together."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the dominant burnout pattern emerging across pressure, recovery, and performance.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how chronic load, overload, depletion, and identity pressure appear to be combining.",
        emotionalDrivers:
          "Premium section on internal pressure, role burden, overfunctioning, and the emotional mechanics underneath burnout.",
        dailyLifeImpact:
          "Premium section translating the pattern into work, relationships, attention, and off-duty life.",
        blindSpots:
          "Premium section surfacing hidden rules, identity strain, and the quieter ways burnout can normalize itself.",
        stabilitySuggestions:
          "Premium section for more believable recovery, clearer limits, and less punishing performance logic.",
        relatedInsights:
          "Related assessments and bundle paths that make sense after this burnout-pattern result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit burnout, motivation, identity, and performance-pattern reports together."
  } satisfies AssessmentDefinition;
})();

const attachmentStyleDimensions = [
  dimension(
    "reassurance_sensitivity",
    "Reassurance Sensitivity",
    "Reassure",
    "closeness and steadiness feel hard to trust without repeated signals of care or certainty"
  ),
  dimension(
    "independence_tension",
    "Independence Tension",
    "Independence",
    "closeness can activate a counter-pull toward space, self-protection, or emotional distance"
  ),
  dimension(
    "abandonment_sensitivity",
    "Abandonment Sensitivity",
    "Abandon",
    "small changes in availability or tone quickly trigger fear of loss, rejection, or disconnection"
  ),
  dimension(
    "emotional_guarding",
    "Emotional Guarding",
    "Guarding",
    "being fully emotionally open or dependent on the relationship feels harder to tolerate than it first appears"
  ),
  dimension(
    "relationship_regulation",
    "Relationship Regulation Strain",
    "Regulate",
    "your inner steadiness becomes too dependent on how the relationship feels moment to moment"
  )
];

const attachmentStyleQuestions = [
  scale({
    id: "ars-close-1",
    sectionId: "ars-closeness",
    prompt:
      "I notice even small changes in warmth, responsiveness, or tone fairly quickly in people I care about.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1.2,
      abandonment_sensitivity: 1.1
    },
    highValueContextMarkers: ["small_shifts_noticed_fast"]
  }),
  choice({
    id: "ars-close-2",
    sectionId: "ars-closeness",
    prompt: "After a close or connected moment, your most common next reaction is:",
    type: "situational",
    options: [
      {
        id: "steady-after-closeness",
        label: "I generally stay steady and let the closeness be enough for the moment.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "want-more-proof",
        label: "Part of me wants another sign that the closeness was real and still there.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 3,
          abandonment_sensitivity: 1
        },
        contextMarkers: ["closeness_needs_reinforcement"]
      },
      {
        id: "need-a-little-space",
        label: "I can suddenly want a little distance so I do not feel too exposed.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          emotional_guarding: 2
        },
        contextMarkers: ["closeness_triggers_space"]
      },
      {
        id: "scan-for-shift",
        label: "I start scanning for whether the energy is about to change again.",
        value: 4,
        dimensionWeights: {
          relationship_regulation: 2,
          reassurance_sensitivity: 1,
          abandonment_sensitivity: 1
        },
        contextMarkers: ["post_closeness_scanning"]
      }
    ]
  }),
  scale({
    id: "ars-close-3",
    sectionId: "ars-closeness",
    prompt:
      "Closeness can grow without me needing constant signs that it is still safe or still real.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1.4,
      relationship_regulation: 0.7
    },
    reverseScored: true
  }),
  choice({
    id: "ars-close-4",
    sectionId: "ars-closeness",
    prompt: "The strongest tension in relationships usually shows up around:",
    type: "multiple_choice",
    options: [
      {
        id: "unclear-availability",
        label: "Unclear availability or mixed emotional signals.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 2
        },
        contextMarkers: ["availability_uncertainty"]
      },
      {
        id: "too-much-closeness",
        label: "Too much closeness too fast, especially when I feel overexposed.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          emotional_guarding: 2
        },
        contextMarkers: ["too_much_closeness_too_fast"]
      },
      {
        id: "repair-after-conflict",
        label: "Trying to feel safe again after conflict or disconnection.",
        value: 4,
        dimensionWeights: {
          abandonment_sensitivity: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["post_conflict_unsafety"]
      },
      {
        id: "being-known-fully",
        label: "Letting someone see more of me without tightening up or managing the exposure.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 3,
          independence_tension: 1
        },
        contextMarkers: ["being_known_feels_risky"]
      }
    ]
  }),
  scale({
    id: "ars-close-5",
    sectionId: "ars-closeness",
    prompt:
      "I can want closeness and still become restless or activated once it is actually present.",
    scaleKey: "agreement",
    dimensionWeights: {
      independence_tension: 1.2,
      reassurance_sensitivity: 0.8,
      emotional_guarding: 0.8
    }
  }),
  choice({
    id: "ars-close-6",
    sectionId: "ars-closeness",
    prompt: "Which feels more familiar?",
    type: "forced_choice",
    options: [
      {
        id: "want-more-reassurance",
        label: "I more often want a little more reassurance or consistency than I am getting.",
        value: 3,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 1
        }
      },
      {
        id: "want-more-space",
        label: "I more often need a little more space or room to regulate than I say out loud.",
        value: 3,
        dimensionWeights: {
          independence_tension: 2,
          emotional_guarding: 1
        }
      }
    ]
  }),
  scale({
    id: "ars-close-7",
    sectionId: "ars-closeness",
    prompt:
      "A warm or intimate moment can still leave me wondering how secure it really is once the moment passes.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1.2,
      abandonment_sensitivity: 1.1,
      relationship_regulation: 0.6
    },
    highValueContextMarkers: ["closeness_fades_into_question"]
  }),
  scale({
    id: "ars-unc-1",
    sectionId: "ars-uncertainty",
    prompt:
      "Waiting longer than expected for a reply can change my internal state faster than I outwardly show.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1.2,
      abandonment_sensitivity: 1.3
    },
    highValueContextMarkers: ["reply_delay_changes_state"]
  }),
  choice({
    id: "ars-unc-2",
    sectionId: "ars-uncertainty",
    prompt: "If someone important seems a little off, your most common reaction is to:",
    type: "situational",
    options: [
      {
        id: "stay-steady-and-ask",
        label: "Stay fairly steady and ask when it makes sense.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "scan-and-infer",
        label: "Scan for signs and start inferring what changed.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["uncertainty_triggers_scanning"]
      },
      {
        id: "feel-rejected-early",
        label: "Feel the emotional hit sooner than I want to admit.",
        value: 4,
        dimensionWeights: {
          abandonment_sensitivity: 3,
          reassurance_sensitivity: 1
        },
        contextMarkers: ["early_rejection_hit"]
      },
      {
        id: "pull-back-first",
        label: "Pull back first so I do not stay too exposed while I wait.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          independence_tension: 2
        },
        contextMarkers: ["withdraw_before_clarity"]
      }
    ]
  }),
  scale({
    id: "ars-unc-3",
    sectionId: "ars-uncertainty",
    prompt:
      "Mixed signals can become internally louder than direct reassurance once I have started to worry.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1.1,
      abandonment_sensitivity: 1.1,
      relationship_regulation: 0.8
    }
  }),
  choice({
    id: "ars-unc-4",
    sectionId: "ars-uncertainty",
    prompt: "The reassurance that helps most is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "consistent-follow-through",
        label: "Consistent follow-through over time, more than a single comforting statement.",
        value: 3,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          relationship_regulation: 1
        }
      },
      {
        id: "clear-verbal-clarity",
        label: "Direct verbal clarity that names where we stand.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 3,
          abandonment_sensitivity: 1
        },
        contextMarkers: ["needs_named_clarity"]
      },
      {
        id: "space-without-punishment",
        label: "Space that does not feel like distance or punishment.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          abandonment_sensitivity: 2
        },
        contextMarkers: ["space_must_feel_safe"]
      },
      {
        id: "steady-self-regulation",
        label: "Mostly my own ability to regulate before I interpret too much.",
        value: 1,
        dimensionWeights: {
          relationship_regulation: 1
        }
      }
    ]
  }),
  scale({
    id: "ars-unc-5",
    sectionId: "ars-uncertainty",
    prompt:
      "The state of the relationship can determine my inner steadiness more than I want it to.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.6
    },
    highValueContextMarkers: ["relationship_state_sets_inner_state"]
  }),
  scale({
    id: "ars-unc-6",
    sectionId: "ars-uncertainty",
    prompt:
      "I can tolerate some uncertainty in a relationship without it quickly turning into a regulation problem.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 1,
      abandonment_sensitivity: 1,
      relationship_regulation: 1
    },
    reverseScored: true
  }),
  choice({
    id: "ars-unc-7",
    sectionId: "ars-uncertainty",
    prompt: "If someone important says they need space, I am most likely to:",
    type: "situational",
    options: [
      {
        id: "hear-it-and-stay-steady",
        label: "Hear it, stay relatively steady, and let the space mean what it actually means.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "scan-for-hidden-meaning",
        label: "Agree outwardly while internally scanning for what it really means.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["space_triggers_hidden_meaning_scan"]
      },
      {
        id: "feel-fear-and-understanding",
        label: "Feel both understanding and immediate fear of distance at the same time.",
        value: 4,
        dimensionWeights: {
          abandonment_sensitivity: 2,
          independence_tension: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["space_triggers_mixed_fear"]
      },
      {
        id: "pull-back-first",
        label: "Pull back first so I am not left waiting in an exposed position.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          emotional_guarding: 1,
          abandonment_sensitivity: 1
        },
        contextMarkers: ["space_met_with_preemptive_pullback"]
      }
    ]
  }),
  scale({
    id: "ars-dist-1",
    sectionId: "ars-distance",
    prompt:
      "When closeness starts to feel exposing, I can become less emotionally readable without planning to.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_guarding: 1.5,
      independence_tension: 0.8
    },
    highValueContextMarkers: ["guarding_after_exposure"]
  }),
  choice({
    id: "ars-dist-2",
    sectionId: "ars-distance",
    prompt: "When someone wants more emotional access than feels comfortable, you most often:",
    type: "situational",
    options: [
      {
        id: "name-needs-clearly",
        label: "Name your needs clearly without shutting down the connection.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "become-harder-to-read",
        label: "Become harder to read while trying not to make it obvious.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 3,
          independence_tension: 1
        },
        contextMarkers: ["harder_to_read_under_closeness"]
      },
      {
        id: "need-space-fast",
        label: "Need space quickly so you can get your footing back.",
        value: 4,
        dimensionWeights: {
          independence_tension: 3,
          emotional_guarding: 1
        },
        contextMarkers: ["space_needed_fast"]
      },
      {
        id: "stay-but-go-flat",
        label: "Stay present externally while something in you quietly goes flatter.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["stay_present_but_withdraw_inside"]
      }
    ]
  }),
  scale({
    id: "ars-dist-3",
    sectionId: "ars-distance",
    prompt:
      "I can stay connected without feeling that I am losing too much independence, privacy, or internal room.",
    scaleKey: "agreement",
    dimensionWeights: {
      independence_tension: 1.5,
      emotional_guarding: 0.7
    },
    reverseScored: true
  }),
  choice({
    id: "ars-dist-4",
    sectionId: "ars-distance",
    prompt: "The urge for distance is most often about:",
    type: "multiple_choice",
    options: [
      {
        id: "reset-nervous-system",
        label: "Resetting because closeness became internally loud or demanding.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["distance_as_regulation"]
      },
      {
        id: "protecting-private-self",
        label: "Protecting parts of yourself that do not feel safe to expose too quickly.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 3
        },
        contextMarkers: ["private_self_protection"]
      },
      {
        id: "avoiding-neediness",
        label: "Preventing yourself from looking too dependent or too affected.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          reassurance_sensitivity: 1,
          independence_tension: 1
        },
        contextMarkers: ["distance_to_avoid_neediness"]
      },
      {
        id: "not-main-pattern",
        label: "Distance is not usually the main pattern for me.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  }),
  scale({
    id: "ars-dist-5",
    sectionId: "ars-distance",
    prompt:
      "Part of my relational style is trying to stay connected without ever feeling too dependent on the connection.",
    scaleKey: "agreement",
    dimensionWeights: {
      independence_tension: 1.3,
      emotional_guarding: 1
    }
  }),
  choice({
    id: "ars-dist-6",
    sectionId: "ars-distance",
    prompt: "Which feels more accurate in conflict or vulnerability?",
    type: "forced_choice",
    options: [
      {
        id: "move-toward-clarity",
        label: "I generally move toward clarity even if I feel exposed.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "protect-exposure",
        label: "Part of me protects the exposure first, even if clarity gets delayed.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          independence_tension: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["protect_exposure_before_clarity"]
      }
    ]
  }),
  scale({
    id: "ars-dist-7",
    sectionId: "ars-distance",
    prompt:
      "I can look very independent on the outside when part of me is actually trying to manage vulnerability.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_guarding: 1.2,
      independence_tension: 1
    },
    highValueContextMarkers: ["independence_as_cover"]
  }),
  scale({
    id: "ars-conf-1",
    sectionId: "ars-conflict",
    prompt:
      "Conflict can destabilize the relationship inside me faster than I want it to.",
    scaleKey: "agreement",
    dimensionWeights: {
      abandonment_sensitivity: 1.2,
      relationship_regulation: 1.2
    },
    highValueContextMarkers: ["conflict_quickly_destabilizes"]
  }),
  choice({
    id: "ars-conf-2",
    sectionId: "ars-conflict",
    prompt: "After tension with someone important, your first move is most often to:",
    type: "situational",
    options: [
      {
        id: "repair-directly",
        label: "Move toward repair directly and fairly quickly.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "seek-signs",
        label: "Seek signs that the bond is still intact before you can settle.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 2
        },
        contextMarkers: ["needs_bond_signal_after_conflict"]
      },
      {
        id: "go-quiet",
        label: "Go quiet or controlled while you try to regain internal footing.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["quiet_after_conflict"]
      },
      {
        id: "need-space-first",
        label: "Need space first because repair feels harder when you are activated.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["space_before_repair"]
      }
    ]
  }),
  scale({
    id: "ars-conf-3",
    sectionId: "ars-conflict",
    prompt:
      "Once the connection feels strained, it is harder than I want to hold a steady sense that we are still okay.",
    scaleKey: "agreement",
    dimensionWeights: {
      abandonment_sensitivity: 1.3,
      relationship_regulation: 1.1
    }
  }),
  choice({
    id: "ars-conf-4",
    sectionId: "ars-conflict",
    prompt: "The most stabilizing kind of repair is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "clear-acknowledgment",
        label: "Clear acknowledgment of what happened and where the bond stands.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 2
        }
      },
      {
        id: "calm-space-then-return",
        label: "A calm pause followed by genuine return, not forced immediate closeness.",
        value: 4,
        dimensionWeights: {
          independence_tension: 2,
          emotional_guarding: 1,
          relationship_regulation: 1
        }
      },
      {
        id: "consistent-actions",
        label: "Consistency after the repair more than the repair conversation itself.",
        value: 3,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          relationship_regulation: 1
        }
      },
      {
        id: "self-settling-first",
        label: "My own ability to settle before I interpret too much.",
        value: 2,
        dimensionWeights: {
          relationship_regulation: 2
        }
      }
    ]
  }),
  scale({
    id: "ars-conf-5",
    sectionId: "ars-conflict",
    prompt:
      "I can disagree with someone important without quickly feeling either unsafe, exposed, or emotionally overactivated.",
    scaleKey: "agreement",
    dimensionWeights: {
      abandonment_sensitivity: 1,
      emotional_guarding: 0.8,
      relationship_regulation: 1
    },
    reverseScored: true
  }),
  scale({
    id: "ars-conf-6",
    sectionId: "ars-conflict",
    prompt:
      "The state of the bond can affect my concentration, body tension, or emotional tone more than I openly show.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.5,
      abandonment_sensitivity: 0.7
    },
    highValueContextMarkers: ["bond_state_affects_functioning"]
  }),
  scale({
    id: "ars-conf-7",
    sectionId: "ars-conflict",
    prompt:
      "Even after a conflict is technically resolved, part of me can keep checking whether the relationship is really steady again.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.2,
      reassurance_sensitivity: 1.1,
      abandonment_sensitivity: 0.7
    },
    highValueContextMarkers: ["repair_not_fully_landing"]
  }),
  scale({
    id: "ars-reg-1",
    sectionId: "ars-regulation",
    prompt:
      "A steadier relationship style would require me to rely a little less on signals from the other person to know where I stand inside myself.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.5,
      reassurance_sensitivity: 0.8
    }
  }),
  choice({
    id: "ars-reg-2",
    sectionId: "ars-regulation",
    prompt: "When you are trying to settle yourself in a relationship, you most often:",
    type: "multiple_choice",
    options: [
      {
        id: "self-settle-well",
        label: "Can usually self-settle without needing immediate relational proof.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "look-for-contact",
        label: "Look for contact, clarity, or reassurance so your system can settle.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          relationship_regulation: 2
        },
        contextMarkers: ["settling_requires_contact"]
      },
      {
        id: "shut-down-need",
        label: "Shut down the need and become more self-contained than you actually feel.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          independence_tension: 2
        },
        contextMarkers: ["self_containment_over_expression"]
      },
      {
        id: "swing-between-both",
        label: "Swing between wanting more closeness and protecting yourself from needing it.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 1,
          independence_tension: 1,
          emotional_guarding: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["approach_withdraw_cycle"]
      }
    ]
  }),
  scale({
    id: "ars-reg-3",
    sectionId: "ars-regulation",
    prompt:
      "My relational style includes some tension between wanting closeness and wanting control over how much I need it.",
    scaleKey: "agreement",
    dimensionWeights: {
      reassurance_sensitivity: 0.8,
      independence_tension: 1,
      emotional_guarding: 1,
      relationship_regulation: 0.6
    }
  }),
  choice({
    id: "ars-reg-4",
    sectionId: "ars-regulation",
    prompt: "The clearest next growth edge in relationships would probably be:",
    type: "multiple_choice",
    options: [
      {
        id: "trusting-consistency-more",
        label: "Trusting consistency a little more without needing constant confirmation.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 2
        }
      },
      {
        id: "staying-open-longer",
        label: "Staying emotionally open longer instead of guarding so quickly.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 3,
          independence_tension: 1
        }
      },
      {
        id: "holding-self-in-conflict",
        label: "Holding your sense of self more steadily when closeness, ambiguity, or conflict shifts.",
        value: 4,
        dimensionWeights: {
          relationship_regulation: 3,
          abandonment_sensitivity: 1
        }
      },
      {
        id: "letting-space-be-safe",
        label: "Letting space exist without reading it as loss or danger.",
        value: 4,
        dimensionWeights: {
          abandonment_sensitivity: 2,
          independence_tension: 2
        }
      }
    ]
  }),
  scale({
    id: "ars-reg-5",
    sectionId: "ars-regulation",
    prompt:
      "I can stay fairly rooted in myself even when the relationship feels uncertain, close, or in repair.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "ars-reg-6",
    sectionId: "ars-regulation",
    prompt:
      "The pattern is not only about what I need from relationships, but also about how I regulate myself inside them.",
    scaleKey: "agreement",
    dimensionWeights: {
      relationship_regulation: 1.2,
      reassurance_sensitivity: 0.5,
      independence_tension: 0.5
    },
    highValueContextMarkers: ["relationship_as_regulation_system"]
  }),
  choice({
    id: "ars-reg-7",
    sectionId: "ars-regulation",
    prompt: "When the relationship feels uncertain, the hardest thing to hold onto is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "my-own-steadiness",
        label: "My own steadiness separate from what the bond is doing that day.",
        value: 4,
        dimensionWeights: {
          relationship_regulation: 3
        },
        contextMarkers: ["self_steadiness_hard_to_hold"]
      },
      {
        id: "trust-without-proof",
        label: "Trust that connection can remain real without constant proof.",
        value: 4,
        dimensionWeights: {
          reassurance_sensitivity: 2,
          abandonment_sensitivity: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["trust_without_constant_proof"]
      },
      {
        id: "openness-without-protection",
        label: "Openness without immediately moving into protection or distance.",
        value: 4,
        dimensionWeights: {
          emotional_guarding: 2,
          independence_tension: 1,
          relationship_regulation: 1
        },
        contextMarkers: ["openness_without_protection_is_hard"]
      },
      {
        id: "space-not-loss",
        label: "Confidence that space does not automatically mean loss.",
        value: 4,
        dimensionWeights: {
          abandonment_sensitivity: 2,
          independence_tension: 2
        },
        contextMarkers: ["space_feels_like_loss"]
      }
    ]
  })
];

const attachmentStyleAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "ars-closeness",
        title: "Closeness Recognition",
        description: "How you notice, interpret, and respond to emotional closeness.",
        intent: "Measure the first layer of sensitivity around closeness, warmth, and exposure."
      },
      {
        id: "ars-uncertainty",
        title: "Uncertainty and Reassurance",
        description: "What happens when responsiveness, clarity, or emotional consistency becomes less certain.",
        intent: "Capture reassurance needs, abandonment sensitivity, and relationship-based regulation."
      },
      {
        id: "ars-distance",
        title: "Distance and Self-Protection",
        description: "How space, privacy, and emotional guarding show up inside closeness.",
        intent: "Measure the pull toward autonomy, protection, and reduced exposure."
      },
      {
        id: "ars-conflict",
        title: "Conflict and Repair",
        description: "How disagreement, strain, and reconnection affect your sense of safety.",
        intent: "Assess how attachment style reacts once the bond no longer feels perfectly steady."
      },
      {
        id: "ars-regulation",
        title: "Relationship Regulation",
        description: "How much your internal steadiness depends on what is happening in the bond.",
        intent: "Measure the broader regulation pattern underneath closeness, distance, and repair."
      }
    ],
    attachmentStyleQuestions
  );

  return {
    id: "asm_attachment_relationship_style_report",
    slug: "attachment-and-relationship-style-report",
    topicKey: "attachment_style",
    title: "Attachment & Relationship Style Report",
    subtitle:
      "A deeper look at reassurance needs, distance strategies, conflict sensitivity, and how you regulate closeness over time.",
    category: "Attachment",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 7,
    estimatedTimeLabel: minutesLabel(7),
    questionCount: attachmentStyleQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You keep seeing the same patterns around closeness, uncertainty, distance, or repair in relationships and want a clearer read on the style underneath them.",
    previewPromise:
      "See whether reassurance sensitivity, distance protection, abandonment sensitivity, guarding, or regulation strain is most active in your relationship style.",
    reportLabel: "Attachment-style insight report",
    focusAreas: [
      "Reassurance and abandonment sensitivity",
      "Distance, privacy, and emotional guarding",
      "Conflict response and relationship regulation"
    ],
    outcomeHighlights: [
      "Make pursuit, withdrawal, guarding, and repair patterns easier to name.",
      "Show whether your style becomes most activated by uncertainty, closeness, conflict, or overexposure.",
      "Prepare future relationship reports with a stronger base map of how you regulate attachment."
    ],
    introBullets: [
      "Built as a broader attachment product that helps explain relationship style, not just one specific relationship loop.",
      "Questions focus on closeness, reassurance, distance, emotional guarding, conflict repair, and how much the bond sets your internal steadiness.",
      "The resulting report is designed to help you understand the style you bring into relationships, where it protects you, and where it complicates closeness."
    ],
    bundleTags: ["attachment-and-recovery", "relationship-clarity"],
    categoryTags: ["attachment", "relationships", "compatibility"],
    dimensions: attachmentStyleDimensions,
    sections,
    questions: attachmentStyleQuestions,
    relatedAssessments: [
      related(
        "relationship-infatuation-obsession-analysis",
        "Useful if your attachment style is becoming especially visible inside longing loops, mental preoccupation, or mixed-signal relationships."
      ),
      related(
        "toxic-pattern-and-red-flag-report",
        "Useful if relationship instability or boundary pressure is making it hard to tell what belongs to style and what belongs to the dynamic itself.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later keep relationship-style, attachment-loop, red-flag, and recovery reports connected in one private library.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "attachment-and-relationship-style-report",
      title: "Attachment Style Insight Report",
      subtitle:
        "A premium report for reassurance sensitivity, distance protection, conflict response, and relationship regulation.",
      previewPromises: previewSections(
        "See whether your style is most activated by uncertainty, closeness, overexposure, conflict, or regulation strain.",
        "Preview how reassurance needs, self-protection, and bond-based regulation appear to be working together."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the dominant attachment-style pattern visible in your responses.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how reassurance, distance, conflict sensitivity, and regulation appear to fit together.",
        emotionalDrivers:
          "Premium section on closeness sensitivity, self-protection, fear of loss, and the emotional mechanics under the style.",
        dailyLifeImpact:
          "Premium section translating the pattern into communication, conflict, closeness, and relational steadiness.",
        blindSpots:
          "Premium section surfacing subtle cycles of pursuing, guarding, overreading, or self-protecting that shape relationship outcomes.",
        stabilitySuggestions:
          "Premium section for steadier attachment, clearer communication, and more reliable internal regulation.",
        relatedInsights:
          "Related relationship reports and bundle paths that make sense after this attachment-style result."
      }
    }),
    subscriptionUpsellNote:
      "High-value membership anchor for users likely to move across attachment, relationship loops, red flags, and recovery reports."
  } satisfies AssessmentDefinition;
})();

const identityDimensions = [
  dimension(
    "value_misalignment",
    "Value Misalignment",
    "Values",
    "daily choices are drifting away from what feels most internally true or important"
  ),
  dimension(
    "self_concept_instability",
    "Self-Concept Instability",
    "Self-concept",
    "your sense of who you are changes too quickly across roles, settings, or internal states"
  ),
  dimension(
    "external_expectation_pressure",
    "External Expectation Pressure",
    "Expectations",
    "other people's needs, roles, or imagined standards are shaping your choices more than you want"
  ),
  dimension(
    "decision_hesitation",
    "Decision Hesitation",
    "Decision",
    "important choices stall because inner clarity and permission do not arrive together"
  ),
  dimension(
    "internal_narrative_conflict",
    "Internal Narrative Conflict",
    "Narrative",
    "different stories about who you are or should be remain in active conflict with each other"
  )
];

const identityQuestions = [
  scale({
    id: "iic-self-1",
    sectionId: "iic-self",
    prompt:
      "Different versions of me can take turns running my life strongly enough that I do not always feel like one continuous self.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_concept_instability: 1.6
    },
    highValueContextMarkers: ["multiple_self_versions_active"]
  }),
  choice({
    id: "iic-self-2",
    sectionId: "iic-self",
    prompt: "When someone asks what you really want, your first internal response is usually:",
    type: "situational",
    options: [
      {
        id: "can-answer-fairly-clearly",
        label: "I can answer fairly clearly, even if the choice is not easy.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "scan-expectations-first",
        label: "I instinctively scan what would make the most sense to other people first.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 3,
          decision_hesitation: 1
        },
        contextMarkers: ["expectations_scanned_before_self"]
      },
      {
        id: "feel-split-between-paths",
        label: "I can feel two or more real versions of me answering differently.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["split_answers_inside"]
      },
      {
        id: "blank-then-construct",
        label: "I go blank for a moment, then try to construct an answer that sounds coherent.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          decision_hesitation: 2
        },
        contextMarkers: ["blank_then_constructed_answer"]
      }
    ]
  }),
  scale({
    id: "iic-self-3",
    sectionId: "iic-self",
    prompt:
      "My choices usually feel like a recognizable extension of who I am, not a patchwork response to context.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_concept_instability: 1.4,
      value_misalignment: 0.8
    },
    reverseScored: true
  }),
  choice({
    id: "iic-self-4",
    sectionId: "iic-self",
    prompt: "The strongest source of inner split right now is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "roles-versus-values",
        label: "What my roles ask of me versus what actually feels true.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          external_expectation_pressure: 2
        },
        contextMarkers: ["roles_vs_values"]
      },
      {
        id: "private-versus-public-self",
        label: "Who I am privately versus who I know how to be in public.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["private_public_split"]
      },
      {
        id: "old-versus-current-self",
        label: "The version of me I have been versus the one that is trying to emerge.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 1,
          internal_narrative_conflict: 2,
          decision_hesitation: 1
        },
        contextMarkers: ["old_self_vs_new_self"]
      },
      {
        id: "too-many-good-reasons",
        label: "Several legitimate directions, none of which feel simple to trust.",
        value: 3,
        dimensionWeights: {
          decision_hesitation: 2,
          internal_narrative_conflict: 1
        }
      }
    ]
  }),
  scale({
    id: "iic-self-5",
    sectionId: "iic-self",
    prompt:
      "Life can look coherent from the outside while not feeling internally integrated to me.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_concept_instability: 1.2,
      internal_narrative_conflict: 1
    }
  }),
  choice({
    id: "iic-self-6",
    sectionId: "iic-self",
    prompt: "Which feels more accurate?",
    type: "forced_choice",
    options: [
      {
        id: "not-sure-what-i-want",
        label: "The main problem is that I still do not fully know what I want.",
        value: 3,
        dimensionWeights: {
          self_concept_instability: 1,
          decision_hesitation: 2
        }
      },
      {
        id: "know-but-hesitate",
        label: "The main problem is that I know more than I act on because the cost feels complicated.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          external_expectation_pressure: 1,
          decision_hesitation: 1
        },
        contextMarkers: ["knows_but_hesitates"]
      }
    ]
  }),
  scale({
    id: "iic-self-7",
    sectionId: "iic-self",
    prompt:
      "I can adapt well in different settings and still sometimes wonder which parts are adaptation versus the real center of me.",
    scaleKey: "agreement",
    dimensionWeights: {
      self_concept_instability: 1.4,
      value_misalignment: 0.7
    },
    highValueContextMarkers: ["adaptation_vs_center"]
  }),
  scale({
    id: "iic-exp-1",
    sectionId: "iic-expectations",
    prompt:
      "A meaningful amount of my life is shaped by what will be easiest to justify to other people.",
    scaleKey: "agreement",
    dimensionWeights: {
      external_expectation_pressure: 1.6
    },
    highValueContextMarkers: ["life_shaped_by_what_is_justifiable"]
  }),
  choice({
    id: "iic-exp-2",
    sectionId: "iic-expectations",
    prompt: "When a choice disappoints someone, your first instinct is most often to:",
    type: "situational",
    options: [
      {
        id: "stay-with-choice",
        label: "Stay with your choice if it still feels right.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "reconsider-fast",
        label: "Reconsider quickly because the tension feels hard to hold.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          decision_hesitation: 2
        },
        contextMarkers: ["others_discomfort_changes_choice"]
      },
      {
        id: "explain-yourself",
        label: "Overexplain so your choice seems easier for them to accept.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 3,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["overexplaining_for_permission"]
      },
      {
        id: "feel-split-inside",
        label: "Feel a split between loyalty to yourself and loyalty to them.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["self_loyalty_vs_other_loyalty"]
      }
    ]
  }),
  scale({
    id: "iic-exp-3",
    sectionId: "iic-expectations",
    prompt:
      "I can usually tell the difference between what I genuinely want and what I have adapted myself to want.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 1.2,
      external_expectation_pressure: 1.1
    },
    reverseScored: true
  }),
  choice({
    id: "iic-exp-4",
    sectionId: "iic-expectations",
    prompt: "The hardest expectation to step outside is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "family-script",
        label: "Family or long-held role expectations about who I am supposed to be.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 3,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["family_script"]
      },
      {
        id: "competence-image",
        label: "The image of being reliable, capable, or stable in a certain way.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          self_concept_instability: 1,
          decision_hesitation: 1
        },
        contextMarkers: ["competence_image"]
      },
      {
        id: "relational-role",
        label: "The role I have learned to play in close relationships.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          value_misalignment: 1,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["relational_role_expectation"]
      },
      {
        id: "self-imposed-ideal",
        label: "The version of myself I feel I should have become by now.",
        value: 4,
        dimensionWeights: {
          internal_narrative_conflict: 2,
          decision_hesitation: 1,
          external_expectation_pressure: 1
        },
        contextMarkers: ["idealized_self_pressure"]
      }
    ]
  }),
  scale({
    id: "iic-exp-5",
    sectionId: "iic-expectations",
    prompt:
      "I sometimes maintain a life structure that looks right enough from the outside while feeling increasingly less like me inside it.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 1.2,
      external_expectation_pressure: 1
    }
  }),
  scale({
    id: "iic-exp-6",
    sectionId: "iic-expectations",
    prompt:
      "Other people's reactions matter to me, but they do not usually overrule what feels most internally true.",
    scaleKey: "agreement",
    dimensionWeights: {
      external_expectation_pressure: 1.5
    },
    reverseScored: true
  }),
  choice({
    id: "iic-exp-7",
    sectionId: "iic-expectations",
    prompt:
      "When someone praises you for being the version of yourself they are used to, your reaction is most often:",
    type: "situational",
    options: [
      {
        id: "receive-it-easily",
        label: "It feels accurate enough that I can receive it easily.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "partial-truth-tension",
        label: "Appreciation mixed with tension because that version is only part of who I am now.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["praise_hits_partial_self"]
      },
      {
        id: "relief-because-stable",
        label: "Relief, because it keeps expectations stable even if it is not the full truth.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 3,
          value_misalignment: 1
        },
        contextMarkers: ["stability_of_expected_self"]
      },
      {
        id: "pressure-because-harder-to-change",
        label: "Pressure, because it makes change or honesty feel more disruptive.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          decision_hesitation: 2
        },
        contextMarkers: ["praise_makes_change_harder"]
      }
    ]
  }),
  scale({
    id: "iic-dec-1",
    sectionId: "iic-decisions",
    prompt:
      "Important choices can stay unresolved because clarity and permission do not seem to arrive at the same time.",
    scaleKey: "agreement",
    dimensionWeights: {
      decision_hesitation: 1.6
    },
    highValueContextMarkers: ["clarity_without_permission_or_reverse"]
  }),
  choice({
    id: "iic-dec-2",
    sectionId: "iic-decisions",
    prompt: "When a decision matters, your internal process is most often:",
    type: "multiple_choice",
    options: [
      {
        id: "steady-weighing",
        label: "I weigh it carefully, then move once I know enough.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "overthinking-costs",
        label: "I keep replaying possible costs because the wrong move feels too defining.",
        value: 4,
        dimensionWeights: {
          decision_hesitation: 3,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["decision_feels_identity_defining"]
      },
      {
        id: "toggle-between-selves",
        label: "Different versions of me keep making different cases.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["decision_arguments_by_different_self_versions"]
      },
      {
        id: "delay-until-forced",
        label: "I delay until circumstances narrow the options for me.",
        value: 4,
        dimensionWeights: {
          decision_hesitation: 2,
          external_expectation_pressure: 1,
          value_misalignment: 1
        },
        contextMarkers: ["delay_until_forced"]
      }
    ]
  }),
  scale({
    id: "iic-dec-3",
    sectionId: "iic-decisions",
    prompt:
      "I can end up choosing based on what prevents regret rather than what feels most aligned.",
    scaleKey: "agreement",
    dimensionWeights: {
      decision_hesitation: 1.3,
      value_misalignment: 1
    }
  }),
  choice({
    id: "iic-dec-4",
    sectionId: "iic-decisions",
    prompt: "The part that makes decisions hardest is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "not-enough-certainty",
        label: "I do not feel certain enough about what the right move is.",
        value: 3,
        dimensionWeights: {
          decision_hesitation: 2,
          self_concept_instability: 1
        }
      },
      {
        id: "too-many-costs",
        label: "Every path feels like it betrays something important.",
        value: 4,
        dimensionWeights: {
          internal_narrative_conflict: 2,
          decision_hesitation: 2
        },
        contextMarkers: ["every_path_costs_identity"]
      },
      {
        id: "permission-problem",
        label: "Part of me knows what I want, but I do not fully grant myself permission.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          external_expectation_pressure: 1,
          decision_hesitation: 1
        },
        contextMarkers: ["permission_problem"]
      },
      {
        id: "identity-shift",
        label: "The decision would force a version of me to become more real than it is now.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 1,
          internal_narrative_conflict: 2,
          decision_hesitation: 1
        },
        contextMarkers: ["decision_requires_identity_shift"]
      }
    ]
  }),
  scale({
    id: "iic-dec-5",
    sectionId: "iic-decisions",
    prompt:
      "I can usually move on a meaningful choice before it turns into a long-running internal referendum.",
    scaleKey: "agreement",
    dimensionWeights: {
      decision_hesitation: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "iic-dec-6",
    sectionId: "iic-decisions",
    prompt:
      "The longer a decision stays open, the more it starts to affect my sense of self rather than just the decision itself.",
    scaleKey: "agreement",
    dimensionWeights: {
      decision_hesitation: 1.1,
      self_concept_instability: 0.9,
      internal_narrative_conflict: 0.7
    },
    highValueContextMarkers: ["open_decision_affects_identity"]
  }),
  scale({
    id: "iic-dec-7",
    sectionId: "iic-decisions",
    prompt:
      "Some decisions stay open because choosing one path can feel like making one version of me more real than the others.",
    scaleKey: "agreement",
    dimensionWeights: {
      decision_hesitation: 1.2,
      internal_narrative_conflict: 1.1,
      self_concept_instability: 0.7
    },
    highValueContextMarkers: ["decision_makes_one_self_more_real"]
  }),
  scale({
    id: "iic-narr-1",
    sectionId: "iic-narrative",
    prompt:
      "I carry more than one convincing story about who I am, and those stories do not fully agree.",
    scaleKey: "agreement",
    dimensionWeights: {
      internal_narrative_conflict: 1.6
    },
    highValueContextMarkers: ["multiple_convincing_stories"]
  }),
  choice({
    id: "iic-narr-2",
    sectionId: "iic-narrative",
    prompt: "The tension between your internal stories most often sounds like:",
    type: "multiple_choice",
    options: [
      {
        id: "be-practical-vs-be-real",
        label: "\"Be practical\" versus \"be more fully real.\"",
        value: 4,
        dimensionWeights: {
          internal_narrative_conflict: 2,
          value_misalignment: 2
        },
        contextMarkers: ["practical_vs_real"]
      },
      {
        id: "stay-safe-vs-step-forward",
        label: "\"Stay safe\" versus \"step into the life that fits better.\"",
        value: 4,
        dimensionWeights: {
          internal_narrative_conflict: 2,
          decision_hesitation: 2
        },
        contextMarkers: ["safe_vs_true"]
      },
      {
        id: "keep-role-vs-change-shape",
        label: "\"Keep the role\" versus \"change shape enough to feel more like myself.\"",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          external_expectation_pressure: 1,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["role_vs_self_shape"]
      },
      {
        id: "leave-things-stable-vs-admit-empty",
        label: "\"Keep things stable\" versus \"admit the current version is no longer enough.\"",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["stable_vs_alive"]
      }
    ]
  }),
  scale({
    id: "iic-narr-3",
    sectionId: "iic-narrative",
    prompt:
      "I can feel disloyal to an old version of myself even when part of me knows I have outgrown it.",
    scaleKey: "agreement",
    dimensionWeights: {
      internal_narrative_conflict: 1.3,
      self_concept_instability: 0.9,
      decision_hesitation: 0.5
    }
  }),
  choice({
    id: "iic-narr-4",
    sectionId: "iic-narrative",
    prompt: "When you imagine living more in alignment, the hardest part is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "cost-to-others",
        label: "The cost it might create in other relationships or roles.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          decision_hesitation: 1,
          value_misalignment: 1
        },
        contextMarkers: ["alignment_has_relational_cost"]
      },
      {
        id: "admitting-current-mismatch",
        label: "Admitting how long I have stayed in something that no longer fits.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["admitting_longstanding_mismatch"]
      },
      {
        id: "not-knowing-new-self",
        label: "Trusting the version of me that is still becoming clearer.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          decision_hesitation: 1,
          internal_narrative_conflict: 1
        },
        contextMarkers: ["new_self_not_fully_trusted"]
      },
      {
        id: "giving-up-old-validation",
        label: "Giving up identities or validations that have organized me for a long time.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 1,
          value_misalignment: 1,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["old_validation_hard_to_release"]
      }
    ]
  }),
  scale({
    id: "iic-narr-5",
    sectionId: "iic-narrative",
    prompt:
      "I can make room for complexity in who I am without feeling fragmented by it.",
    scaleKey: "agreement",
    dimensionWeights: {
      internal_narrative_conflict: 1.4,
      self_concept_instability: 0.8
    },
    reverseScored: true
  }),
  scale({
    id: "iic-narr-6",
    sectionId: "iic-narrative",
    prompt:
      "Part of the difficulty is not only choosing a path, but deciding which inner story should be trusted more than the others.",
    scaleKey: "agreement",
    dimensionWeights: {
      internal_narrative_conflict: 1.3,
      decision_hesitation: 0.8
    },
    highValueContextMarkers: ["which_story_to_trust"]
  }),
  choice({
    id: "iic-narr-7",
    sectionId: "iic-narrative",
    prompt: "When you revisit an older goal or identity, you most often feel:",
    type: "multiple_choice",
    options: [
      {
        id: "still-mostly-fits",
        label: "It still fits well enough, even if I have changed around it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "respect-with-distance",
        label: "Respect for who I was, but a clear sense that it no longer fully fits.",
        value: 2,
        dimensionWeights: {
          value_misalignment: 1,
          self_concept_instability: 1
        }
      },
      {
        id: "guilt-about-not-wanting-it",
        label: "Guilt because part of me still thinks I should want it more than I do.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 1,
          internal_narrative_conflict: 2,
          value_misalignment: 1
        },
        contextMarkers: ["should_still_want_old_identity"]
      },
      {
        id: "cannot-tell-outgrew-or-failed",
        label: "Confusion about whether I outgrew it or simply failed it.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["outgrew_or_failed_unclear"]
      }
    ]
  }),
  scale({
    id: "iic-coh-1",
    sectionId: "iic-coherence",
    prompt:
      "I want more coherence in my life, not because I need perfect certainty, but because the internal split has started to cost too much.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 0.9,
      self_concept_instability: 0.9,
      internal_narrative_conflict: 0.9
    }
  }),
  choice({
    id: "iic-coh-2",
    sectionId: "iic-coherence",
    prompt: "What would feel most relieving right now?",
    type: "multiple_choice",
    options: [
      {
        id: "clearer-inner-direction",
        label: "A clearer sense of what actually feels true for me.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          value_misalignment: 2
        }
      },
      {
        id: "permission-to-act",
        label: "More permission to act on what I already know.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 2,
          decision_hesitation: 2
        }
      },
      {
        id: "less-inner-argument",
        label: "Less argument inside my own mind about who I am allowed to become.",
        value: 4,
        dimensionWeights: {
          internal_narrative_conflict: 3,
          self_concept_instability: 1
        }
      },
      {
        id: "better-role-fit",
        label: "A life structure that matches me more honestly.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 3,
          external_expectation_pressure: 1
        }
      }
    ]
  }),
  scale({
    id: "iic-coh-3",
    sectionId: "iic-coherence",
    prompt:
      "I can feel small moments of self-alignment already, even if they are not yet stable enough to build on.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 0.6,
      self_concept_instability: 0.6,
      decision_hesitation: 0.6
    },
    reverseScored: true
  }),
  choice({
    id: "iic-coh-4",
    sectionId: "iic-coherence",
    prompt: "If you gave yourself more room to live in alignment, the immediate fear would most likely be:",
    type: "multiple_choice",
    options: [
      {
        id: "disappointing-people",
        label: "Disappointing or confusing other people who rely on the current version of me.",
        value: 4,
        dimensionWeights: {
          external_expectation_pressure: 3,
          decision_hesitation: 1
        },
        contextMarkers: ["alignment_disappoints_others"]
      },
      {
        id: "making-self-too-real",
        label: "Making a newer or truer version of me too real to take back.",
        value: 4,
        dimensionWeights: {
          self_concept_instability: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["alignment_makes_new_self_real"]
      },
      {
        id: "choosing-wrong-version",
        label: "Choosing one path and later realizing I trusted the wrong internal voice.",
        value: 4,
        dimensionWeights: {
          decision_hesitation: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["wrong_inner_voice_fear"]
      },
      {
        id: "admitting-lost-time",
        label: "Having to face how long I have stayed out of alignment already.",
        value: 4,
        dimensionWeights: {
          value_misalignment: 2,
          internal_narrative_conflict: 2
        },
        contextMarkers: ["lost_time_in_misalignment"]
      }
    ]
  }),
  scale({
    id: "iic-coh-5",
    sectionId: "iic-coherence",
    prompt:
      "I trust that greater coherence is possible without needing to simplify myself into something false.",
    scaleKey: "agreement",
    dimensionWeights: {
      internal_narrative_conflict: 1,
      self_concept_instability: 0.8,
      decision_hesitation: 0.7
    },
    reverseScored: true
  }),
  scale({
    id: "iic-coh-6",
    sectionId: "iic-coherence",
    prompt:
      "What I need most may not be reinvention, but a clearer way of living in closer contact with what is already true.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 1.1,
      decision_hesitation: 0.7,
      internal_narrative_conflict: 0.7
    },
    highValueContextMarkers: ["coherence_not_reinvention"]
  }),
  scale({
    id: "iic-coh-7",
    sectionId: "iic-coherence",
    prompt:
      "Moments of self-alignment often arrive as relief because I notice how much internal editing has been happening the rest of the time.",
    scaleKey: "agreement",
    dimensionWeights: {
      value_misalignment: 1.2,
      internal_narrative_conflict: 0.8
    },
    highValueContextMarkers: ["alignment_feels_like_relief"]
  })
];

const identityAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "iic-self",
        title: "Self-Recognition",
        description: "How stable and recognizable your sense of self feels across roles and contexts.",
        intent: "Measure fragmentation, internal split, and the baseline experience of self-recognition."
      },
      {
        id: "iic-expectations",
        title: "Role and Expectation Pressure",
        description: "How much other people's expectations and long-held roles are shaping your choices.",
        intent: "Capture external pressure, adaptation, and the cost of staying legible to others."
      },
      {
        id: "iic-decisions",
        title: "Decision Friction",
        description: "What happens when choices require both inner clarity and permission.",
        intent: "Measure hesitation, over-deliberation, and identity-linked difficulty choosing."
      },
      {
        id: "iic-narrative",
        title: "Narrative Conflict",
        description: "The competing stories you may be carrying about who you are and who you should be.",
        intent: "Assess inner contradiction, role loyalty, and conflict between multiple self-stories."
      },
      {
        id: "iic-coherence",
        title: "Coherence and Reorientation",
        description: "What greater alignment would require and what still makes it hard.",
        intent: "Measure readiness for coherence without demanding oversimplification."
      }
    ],
    identityQuestions
  );

  return {
    id: "asm_identity_inner_conflict_profile",
    slug: "identity-and-inner-conflict-profile",
    topicKey: "identity_conflict",
    title: "Identity & Inner Conflict Profile",
    subtitle:
      "A serious profile for value mismatch, role pressure, self-concept instability, and the inner conflict that makes direction harder to trust.",
    category: "Identity",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: identityQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You feel split between roles, expectations, values, and versions of yourself, but cannot yet see which kind of conflict is actually driving the instability.",
    previewPromise:
      "See whether the clearest pattern is value misalignment, self-concept instability, external pressure, decision hesitation, or narrative conflict.",
    reportLabel: "Identity-pattern insight report",
    focusAreas: [
      "Value misalignment and expectation pressure",
      "Self-concept instability and decision friction",
      "Narrative conflict and internal coherence"
    ],
    outcomeHighlights: [
      "Clarify whether the conflict is driven more by role pressure, inner contradiction, indecision, or life that no longer feels fully yours.",
      "Show where adaptation has outrun authenticity and where internal permission is breaking down.",
      "Prepare a deeper report around coherence, not simplistic reinvention."
    ],
    introBullets: [
      "Built for users who feel internally divided, directionally blurred, or unable to fully trust which version of themselves should be leading.",
      "Questions focus on role pressure, value mismatch, unstable self-recognition, choice difficulty, and the ongoing tension between competing internal stories.",
      "The resulting report is designed to help you understand the structure of the conflict rather than reducing it to vague confusion."
    ],
    bundleTags: ["meaning-and-identity", "self-perception"],
    categoryTags: ["identity", "authenticity", "values"],
    dimensions: identityDimensions,
    sections,
    questions: identityQuestions,
    relatedAssessments: [
      related(
        "imposter-syndrome-deep-report",
        "Useful if identity conflict is showing up as performance strain, competence doubt, or a shaky sense of legitimacy."
      ),
      related(
        "emotional-detachment-nihilism-insight",
        "Useful if the split has started turning into numbness, meaning fatigue, or emotional withdrawal.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later connect identity, meaning, confidence, and recovery reports into one longer-term insight library.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "identity-and-inner-conflict-profile",
      title: "Identity Conflict Insight Report",
      subtitle:
        "A premium report for value mismatch, self-concept instability, expectation pressure, and internal narrative conflict.",
      previewPromises: previewSections(
        "See whether the conflict is being driven most by values, self-definition, external pressure, indecision, or competing inner stories.",
        "Preview how identity split, expectation pressure, and internal hesitation appear to be working together."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the main source of identity friction emerging in your responses.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how self-concept, expectations, values, and inner narrative conflict appear to fit together.",
        emotionalDrivers:
          "Premium section on role loyalty, fear of consequence, inner contradiction, and the emotional pressure under the conflict.",
        dailyLifeImpact:
          "Premium section translating the pattern into decisions, relationships, direction, and daily life alignment.",
        blindSpots:
          "Premium section surfacing subtle self-abandonment, overadaptation, and the costs of staying legible at the expense of coherence.",
        stabilitySuggestions:
          "Premium section for clearer inner permission, more believable alignment, and steadier decision-making.",
        relatedInsights:
          "Related assessments and bundle paths that make sense after this identity-conflict result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit identity, meaning, confidence, and emotional-state reports together."
  } satisfies AssessmentDefinition;
})();

const closureDimensions = [
  dimension(
    "rumination_loops",
    "Rumination Loops",
    "Replay",
    "thoughts keep circling the same chapter, interaction, or unresolved sequence without truly settling"
  ),
  dimension(
    "unresolved_emotional_attachment",
    "Unresolved Emotional Attachment",
    "Attachment",
    "the bond still feels emotionally active even when the chapter should be receding"
  ),
  dimension(
    "meaning_reconstruction_difficulty",
    "Meaning Reconstruction Difficulty",
    "Meaning",
    "it remains hard to build a workable story about what happened and what it now means"
  ),
  dimension(
    "emotional_release_resistance",
    "Emotional Release Resistance",
    "Release",
    "part of you still resists fully loosening the emotional hold of the chapter"
  ),
  dimension(
    "forward_movement_friction",
    "Forward-Movement Friction",
    "Forward",
    "moving into the next chapter feels heavier or more emotionally complicated than expected"
  )
];

const closureQuestions = [
  scale({
    id: "cer-replay-1",
    sectionId: "cer-replay",
    prompt:
      "My mind still replays key moments from this chapter more often than I would like.",
    scaleKey: "frequency",
    dimensionWeights: {
      rumination_loops: 1.6
    },
    highValueContextMarkers: ["key_moments_replayed"]
  }),
  choice({
    id: "cer-replay-2",
    sectionId: "cer-replay",
    prompt: "When the replay starts, it is most often because:",
    type: "multiple_choice",
    options: [
      {
        id: "something-triggered-memory",
        label: "Something concrete triggered the memory and I am just revisiting it briefly.",
        value: 1,
        dimensionWeights: {
          rumination_loops: 1
        }
      },
      {
        id: "trying-to-explain",
        label: "I am still trying to explain what really happened or what it meant.",
        value: 4,
        dimensionWeights: {
          rumination_loops: 2,
          meaning_reconstruction_difficulty: 2
        },
        contextMarkers: ["replay_for_explanation"]
      },
      {
        id: "trying-to-feel-finished",
        label: "Part of me seems to hope replaying it will finally make it feel finished.",
        value: 4,
        dimensionWeights: {
          rumination_loops: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["replay_in_search_of_finish"]
      },
      {
        id: "attachment-reactivates",
        label: "The emotional bond gets reactivated and my mind follows it.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          rumination_loops: 2
        },
        contextMarkers: ["attachment_reactivates_replay"]
      }
    ]
  }),
  scale({
    id: "cer-replay-3",
    sectionId: "cer-replay",
    prompt:
      "A single reminder can reopen more mental activity than the reminder itself seems to deserve.",
    scaleKey: "agreement",
    dimensionWeights: {
      rumination_loops: 1.5,
      unresolved_emotional_attachment: 0.7
    }
  }),
  choice({
    id: "cer-replay-4",
    sectionId: "cer-replay",
    prompt: "The part of the replay that keeps returning most often is:",
    type: "multiple_choice",
    options: [
      {
        id: "what-was-real",
        label: "Trying to work out what was real versus what I hoped or assumed.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          rumination_loops: 2
        },
        contextMarkers: ["replay_for_reality_clarity"]
      },
      {
        id: "what-i-should-have-done",
        label: "Reviewing what I should have said, seen, or done differently.",
        value: 4,
        dimensionWeights: {
          rumination_loops: 3,
          forward_movement_friction: 1
        },
        contextMarkers: ["counterfactual_replay"]
      },
      {
        id: "what-it-still-means",
        label: "What the whole chapter still says about me, them, or my life now.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 3,
          rumination_loops: 1
        },
        contextMarkers: ["meaning_remains_unsettled"]
      },
      {
        id: "whether-door-is-closed",
        label: "Whether the door is really closed or still emotionally open somewhere.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["door_still_feels_open"]
      }
    ]
  }),
  scale({
    id: "cer-replay-5",
    sectionId: "cer-replay",
    prompt:
      "I can usually let the memory pass without feeling pulled into a longer mental loop.",
    scaleKey: "agreement",
    dimensionWeights: {
      rumination_loops: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "cer-replay-6",
    sectionId: "cer-replay",
    prompt:
      "The replay is not only about remembering; it often feels like unfinished processing that has not found a landing point.",
    scaleKey: "agreement",
    dimensionWeights: {
      rumination_loops: 1.1,
      meaning_reconstruction_difficulty: 0.9
    },
    highValueContextMarkers: ["replay_has_no_landing_point"]
  }),
  scale({
    id: "cer-replay-7",
    sectionId: "cer-replay",
    prompt:
      "Unresolved interactions can return at quiet times, as if my mind is still waiting for a version of the conversation that never happened.",
    scaleKey: "agreement",
    dimensionWeights: {
      rumination_loops: 1.2,
      meaning_reconstruction_difficulty: 1
    },
    highValueContextMarkers: ["imagined_missing_conversation"]
  }),
  scale({
    id: "cer-mean-1",
    sectionId: "cer-meaning",
    prompt:
      "It is still hard to build a clear, workable story about what this chapter ultimately meant.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_reconstruction_difficulty: 1.6
    },
    highValueContextMarkers: ["story_not_workable_yet"]
  }),
  choice({
    id: "cer-mean-2",
    sectionId: "cer-meaning",
    prompt: "The unanswered question that carries the most weight is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "what-was-true",
        label: "What was actually true between us.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 3,
          unresolved_emotional_attachment: 1
        },
        contextMarkers: ["truth_of_connection_unsettled"]
      },
      {
        id: "why-it-ended-like-this",
        label: "Why it unfolded or ended the way it did.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 3,
          rumination_loops: 1
        },
        contextMarkers: ["ending_still_unexplained"]
      },
      {
        id: "what-it-says-about-me",
        label: "What the chapter says about me and what I should learn from it.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["self_meaning_question"]
      },
      {
        id: "whether-it-could-return",
        label: "Whether something meaningful still exists or could return later.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["possibility_still_carries_weight"]
      }
    ]
  }),
  scale({
    id: "cer-mean-3",
    sectionId: "cer-meaning",
    prompt:
      "Lack of narrative clarity can keep the chapter emotionally active even when the practical facts are already known.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_reconstruction_difficulty: 1.4,
      unresolved_emotional_attachment: 0.8
    }
  }),
  choice({
    id: "cer-mean-4",
    sectionId: "cer-meaning",
    prompt: "If you had more clarity, what would help most?",
    type: "multiple_choice",
    options: [
      {
        id: "internal-story-that-fits",
        label: "A version of the story I could believe and live with internally.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 3,
          forward_movement_friction: 1
        }
      },
      {
        id: "one-honest-conversation",
        label: "One honest conversation that settled what was left open.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          meaning_reconstruction_difficulty: 2
        }
      },
      {
        id: "accepting-no-answer",
        label: "Greater ability to live without a final answer that feels complete.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 2,
          meaning_reconstruction_difficulty: 2
        }
      },
      {
        id: "seeing-next-chapter",
        label: "A stronger sense of what this chapter is making room for next.",
        value: 4,
        dimensionWeights: {
          forward_movement_friction: 3,
          meaning_reconstruction_difficulty: 1
        }
      }
    ]
  }),
  scale({
    id: "cer-mean-5",
    sectionId: "cer-meaning",
    prompt:
      "Even if I do not like the ending, I can generally make enough sense of it to stop searching for a better explanation.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_reconstruction_difficulty: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "cer-mean-6",
    sectionId: "cer-meaning",
    prompt:
      "Part of the difficulty is that the chapter still feels unfinished at the level of meaning, not just emotion.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_reconstruction_difficulty: 1.3,
      emotional_release_resistance: 0.7
    },
    highValueContextMarkers: ["unfinished_at_meaning_level"]
  }),
  scale({
    id: "cer-mean-7",
    sectionId: "cer-meaning",
    prompt:
      "The absence of a final explanation can keep the chapter more active than the actual events alone would.",
    scaleKey: "agreement",
    dimensionWeights: {
      meaning_reconstruction_difficulty: 1.4,
      rumination_loops: 0.7,
      emotional_release_resistance: 0.5
    },
    highValueContextMarkers: ["lack_of_explanation_keeps_it_active"]
  }),
  scale({
    id: "cer-att-1",
    sectionId: "cer-attachment",
    prompt:
      "The emotional bond still feels more active inside me than I expected by this point.",
    scaleKey: "agreement",
    dimensionWeights: {
      unresolved_emotional_attachment: 1.6
    },
    highValueContextMarkers: ["bond_still_active"]
  }),
  choice({
    id: "cer-att-2",
    sectionId: "cer-attachment",
    prompt: "The bond feels most active when:",
    type: "multiple_choice",
    options: [
      {
        id: "I-miss-them",
        label: "I remember the closeness or the version of myself that existed there.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 3,
          emotional_release_resistance: 1
        },
        contextMarkers: ["misses_connection_and_self"]
      },
      {
        id: "possibility-reopens",
        label: "Some sign of possibility, contact, or imagined return reopens the bond.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["possibility_reopens_bond"]
      },
      {
        id: "comparison-to-present",
        label: "I compare the present to that chapter and it still feels emotionally larger.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["present_compared_to_past_bond"]
      },
      {
        id: "never-fully-left",
        label: "It has never really stopped feeling active beneath the surface.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 3,
          rumination_loops: 1
        },
        contextMarkers: ["bond_never_fully_left"]
      }
    ]
  }),
  scale({
    id: "cer-att-3",
    sectionId: "cer-attachment",
    prompt:
      "Part of me still organizes emotionally around this chapter even when my life is moving in other directions.",
    scaleKey: "agreement",
    dimensionWeights: {
      unresolved_emotional_attachment: 1.4,
      forward_movement_friction: 0.8
    }
  }),
  choice({
    id: "cer-att-4",
    sectionId: "cer-attachment",
    prompt: "What makes the bond hardest to release?",
    type: "multiple_choice",
    options: [
      {
        id: "who-i-was-there",
        label: "What the chapter meant to my identity or sense of aliveness.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          meaning_reconstruction_difficulty: 1,
          emotional_release_resistance: 1
        },
        contextMarkers: ["bond_linked_to_identity"]
      },
      {
        id: "what-it-could-have-been",
        label: "What still feels possible or permanently unfinished about it.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 2,
          unresolved_emotional_attachment: 2
        },
        contextMarkers: ["unfinished_possibility"]
      },
      {
        id: "how-much-it-mattered",
        label: "How much it mattered emotionally, even if it no longer fits my life.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 3,
          emotional_release_resistance: 1
        },
        contextMarkers: ["magnitude_of_mattering"]
      },
      {
        id: "still-no-better-story",
        label: "I do not yet have a better story to carry than the bond itself.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          unresolved_emotional_attachment: 1,
          forward_movement_friction: 1
        },
        contextMarkers: ["bond_is_still_main_story"]
      }
    ]
  }),
  scale({
    id: "cer-att-5",
    sectionId: "cer-attachment",
    prompt:
      "The bond has softened enough that it no longer quietly shapes my internal world very much.",
    scaleKey: "agreement",
    dimensionWeights: {
      unresolved_emotional_attachment: 1.5
    },
    reverseScored: true
  }),
  scale({
    id: "cer-att-6",
    sectionId: "cer-attachment",
    prompt:
      "Even if I know the chapter cannot resume in the same way, some part of me still relates to it as emotionally unfinished.",
    scaleKey: "agreement",
    dimensionWeights: {
      unresolved_emotional_attachment: 1.2,
      emotional_release_resistance: 1
    },
    highValueContextMarkers: ["emotionally_unfinished_even_if_over"]
  }),
  choice({
    id: "cer-att-7",
    sectionId: "cer-attachment",
    prompt: "If the person reached out unexpectedly, I would most likely:",
    type: "situational",
    options: [
      {
        id: "feel-something-stay-clear",
        label: "Feel something, but stay relatively clear about what the contact does and does not mean.",
        value: 1,
        dimensionWeights: {
          unresolved_emotional_attachment: 1
        }
      },
      {
        id: "activate-before-meaning",
        label: "Feel immediate internal activation before I even know what the contact means.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 1,
          rumination_loops: 1
        },
        contextMarkers: ["contact_activates_before_meaning"]
      },
      {
        id: "wonder-what-it-reopens",
        label: "Start wondering what it reopens or changes about the whole chapter.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          unresolved_emotional_attachment: 2
        },
        contextMarkers: ["contact_reopens_whole_story"]
      },
      {
        id: "hope-reactivates-fast",
        label: "Notice hope or possibility reactivate faster than I want it to.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["hope_reactivates_fast"]
      }
    ]
  }),
  scale({
    id: "cer-rel-1",
    sectionId: "cer-release",
    prompt:
      "Letting the chapter soften more fully can feel like losing something I am not yet ready to lose.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_release_resistance: 1.6
    },
    highValueContextMarkers: ["not_ready_to_lose_it_fully"]
  }),
  choice({
    id: "cer-rel-2",
    sectionId: "cer-release",
    prompt: "The hardest part about releasing it would most likely be:",
    type: "multiple_choice",
    options: [
      {
        id: "losing-meaning",
        label: "Losing what the chapter has come to mean inside me.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["release_feels_like_loss_of_meaning"]
      },
      {
        id: "losing-hope",
        label: "Losing the small remaining sense of possibility, return, or unfinished hope.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 3,
          unresolved_emotional_attachment: 1
        },
        contextMarkers: ["release_means_losing_hope"]
      },
      {
        id: "facing-emptiness",
        label: "Facing the emptiness or identity shift that might come afterward.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["release_brings_void"]
      },
      {
        id: "admitting-it-is-over",
        label: "Letting myself fully admit that the chapter is not coming back in the same form.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["full_admission_is_hard"]
      }
    ]
  }),
  scale({
    id: "cer-rel-3",
    sectionId: "cer-release",
    prompt:
      "I can tell the difference between honoring what mattered and continuing to keep it emotionally alive.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_release_resistance: 1.4,
      unresolved_emotional_attachment: 0.7
    },
    reverseScored: true
  }),
  choice({
    id: "cer-rel-4",
    sectionId: "cer-release",
    prompt: "If the emotional grip loosened more than it has, you would most likely feel:",
    type: "situational",
    options: [
      {
        id: "sad-but-lighter",
        label: "Sad, but lighter and more able to keep moving.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "strangely-disloyal",
        label: "Strangely disloyal to what the chapter meant or how deeply you felt it.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 3,
          meaning_reconstruction_difficulty: 1
        },
        contextMarkers: ["release_feels_disloyal"]
      },
      {
        id: "empty-without-it",
        label: "A little empty, as if the attachment has been organizing more of you than you realized.",
        value: 4,
        dimensionWeights: {
          forward_movement_friction: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["attachment_organized_self"]
      },
      {
        id: "still-needing-answer",
        label: "Relieved in one way, but still unable to settle without a clearer answer.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          emotional_release_resistance: 2
        },
        contextMarkers: ["cannot_settle_without_answer"]
      }
    ]
  }),
  scale({
    id: "cer-rel-5",
    sectionId: "cer-release",
    prompt:
      "Part of me would rather stay emotionally connected to the chapter than risk feeling nothing about it.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_release_resistance: 1.4,
      unresolved_emotional_attachment: 0.8
    }
  }),
  scale({
    id: "cer-rel-6",
    sectionId: "cer-release",
    prompt:
      "Release feels less like forgetting and more like tolerating a different emotional relationship to what happened.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_release_resistance: 0.8,
      forward_movement_friction: 0.8
    },
    reverseScored: true
  }),
  scale({
    id: "cer-rel-7",
    sectionId: "cer-release",
    prompt:
      "Part of the resistance comes from not wanting this chapter to become only a memory, lesson, or closed file.",
    scaleKey: "agreement",
    dimensionWeights: {
      emotional_release_resistance: 1.4,
      meaning_reconstruction_difficulty: 0.8,
      unresolved_emotional_attachment: 0.6
    },
    highValueContextMarkers: ["closed_file_resistance"]
  }),
  scale({
    id: "cer-fwd-1",
    sectionId: "cer-forward",
    prompt:
      "Moving forward feels heavier than it seems like it should, even when part of me genuinely wants to.",
    scaleKey: "agreement",
    dimensionWeights: {
      forward_movement_friction: 1.6
    },
    highValueContextMarkers: ["forward_feels_heavy"]
  }),
  choice({
    id: "cer-fwd-2",
    sectionId: "cer-forward",
    prompt: "The main thing that slows forward movement is usually:",
    type: "multiple_choice",
    options: [
      {
        id: "still-turned-back",
        label: "Part of me is still turned back toward the old chapter.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["turned_back_toward_chapter"]
      },
      {
        id: "no-story-for-next",
        label: "I do not yet have a believable sense of what the next chapter is.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["next_chapter_not_believable"]
      },
      {
        id: "guilt-about-moving",
        label: "Moving on can feel like minimizing how much this meant.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["moving_on_feels_like_minimizing"]
      },
      {
        id: "energy-low",
        label: "I want to move forward, but it is hard to generate real emotional energy for it.",
        value: 4,
        dimensionWeights: {
          forward_movement_friction: 3,
          rumination_loops: 1
        },
        contextMarkers: ["little_energy_for_next"]
      }
    ]
  }),
  scale({
    id: "cer-fwd-3",
    sectionId: "cer-forward",
    prompt:
      "I can imagine a meaningful next chapter without it feeling like a betrayal of what came before.",
    scaleKey: "agreement",
    dimensionWeights: {
      forward_movement_friction: 1.4,
      emotional_release_resistance: 0.8
    },
    reverseScored: true
  }),
  choice({
    id: "cer-fwd-4",
    sectionId: "cer-forward",
    prompt: "If life started opening up more again, you would most likely:",
    type: "situational",
    options: [
      {
        id: "step-into-it",
        label: "Feel some grief, but still be able to step into it.",
        value: 0,
        dimensionWeights: {}
      },
      {
        id: "feel-pulled-back",
        label: "Feel pulled back toward the unfinished chapter before you could fully enter the new one.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["new_opening_triggers_old_pull"]
      },
      {
        id: "question-whether-ready",
        label: "Question whether you are allowed to move that far forward yet.",
        value: 4,
        dimensionWeights: {
          emotional_release_resistance: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["permission_to_move_is_unclear"]
      },
      {
        id: "need-story-first",
        label: "Still need a clearer story about the old chapter before the new one can feel emotionally real.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["new_chapter_waiting_on_old_story"]
      }
    ]
  }),
  scale({
    id: "cer-fwd-5",
    sectionId: "cer-forward",
    prompt:
      "There are already signs of forward movement in me, even if they are quieter than the unfinished feelings.",
    scaleKey: "agreement",
    dimensionWeights: {
      forward_movement_friction: 1.2,
      unresolved_emotional_attachment: 0.5
    },
    reverseScored: true
  }),
  scale({
    id: "cer-fwd-6",
    sectionId: "cer-forward",
    prompt:
      "What is unresolved is not only the past itself, but the transition into who I am after it.",
    scaleKey: "agreement",
    dimensionWeights: {
      forward_movement_friction: 1.1,
      meaning_reconstruction_difficulty: 0.9
    },
    highValueContextMarkers: ["identity_after_chapter_unsettled"]
  }),
  choice({
    id: "cer-fwd-7",
    sectionId: "cer-forward",
    prompt: "When something new starts to matter, the most common difficulty is:",
    type: "multiple_choice",
    options: [
      {
        id: "compare-before-entering",
        label: "Comparing it to the unfinished chapter before letting it be its own thing.",
        value: 4,
        dimensionWeights: {
          unresolved_emotional_attachment: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["new_compared_to_old_chapter"]
      },
      {
        id: "do-not-trust-availability",
        label: "Not trusting my emotional availability enough to enter it fully.",
        value: 4,
        dimensionWeights: {
          forward_movement_friction: 2,
          emotional_release_resistance: 1,
          unresolved_emotional_attachment: 1
        },
        contextMarkers: ["new_requires_more_availability"]
      },
      {
        id: "old-story-presses-in",
        label: "Feeling the old chapter press for meaning again just as something new tries to open.",
        value: 4,
        dimensionWeights: {
          meaning_reconstruction_difficulty: 2,
          forward_movement_friction: 2
        },
        contextMarkers: ["old_story_returns_during_new_opening"]
      },
      {
        id: "new-can-stand-on-its-own",
        label: "New things can mostly stand on their own once they begin to matter.",
        value: 0,
        dimensionWeights: {}
      }
    ]
  })
];

const closureAssessment = (() => {
  const sections = attachQuestionIdsToSections(
    [
      {
        id: "cer-replay",
        title: "Mental Replay",
        description: "How often the chapter re-enters thought and how difficult it is to let the loop settle.",
        intent: "Measure replay, unfinished processing, and reactivation through memory."
      },
      {
        id: "cer-meaning",
        title: "Meaning and Unanswered Questions",
        description: "What still feels narratively unresolved about the chapter.",
        intent: "Capture unanswered meaning, missing explanations, and difficulty building a workable story."
      },
      {
        id: "cer-attachment",
        title: "Bond Residue",
        description: "How emotionally active the bond still feels under the surface.",
        intent: "Measure the persistence of attachment after the chapter should be receding."
      },
      {
        id: "cer-release",
        title: "Release Resistance",
        description: "What makes loosening the emotional hold feel costly or premature.",
        intent: "Assess resistance to letting the chapter soften more fully."
      },
      {
        id: "cer-forward",
        title: "Forward Movement",
        description: "What is making the next chapter harder to inhabit than expected.",
        intent: "Measure friction around reorientation, permission, and future pull."
      }
    ],
    closureQuestions
  );

  return {
    id: "asm_closure_emotional_recovery_report",
    slug: "closure-and-emotional-recovery-report",
    topicKey: "closure_recovery",
    title: "Closure & Emotional Recovery Report",
    subtitle:
      "A deeper read on unresolved attachment, unanswered meaning, and what is still keeping an emotional chapter open inside you.",
    category: "Recovery",
    buildStatus: "deep_seeded" as const,
    estimatedTimeMinutes: 6,
    estimatedTimeLabel: minutesLabel(6),
    questionCount: closureQuestions.length,
    privacyNote: DEFAULT_PRIVACY_NOTE,
    targetPainPoint:
      "You know a person, relationship, or life chapter should be receding, but it still feels active enough to keep shaping mood, thought, meaning, and forward movement.",
    previewPromise:
      "See whether the strongest obstacle is replay, unresolved attachment, meaning difficulty, release resistance, or friction around moving forward.",
    reportLabel: "Closure-pattern insight report",
    focusAreas: [
      "Mental replay and unanswered meaning",
      "Unresolved emotional attachment and release resistance",
      "Forward movement and next-chapter friction"
    ],
    outcomeHighlights: [
      "Differentiate emotional attachment, unanswered meaning, and plain replay so the pattern is easier to understand.",
      "Show whether the chapter is staying open through hope, interpretation, unresolved bond, or difficulty inhabiting the next chapter.",
      "Prepare a more thoughtful recovery map than simple advice to let go."
    ],
    introBullets: [
      "Built for users who know something is supposed to be over, but can still feel how active it remains psychologically.",
      "Questions focus on replay, unanswered questions, bond residue, release difficulty, and the emotional complexity of moving into what comes next.",
      "The resulting report is designed to clarify what is actually keeping the chapter open inside you and why closure may not yet feel emotionally believable."
    ],
    bundleTags: ["attachment-and-recovery", "meaning-and-identity"],
    categoryTags: ["recovery", "breakup", "closure"],
    dimensions: closureDimensions,
    sections,
    questions: closureQuestions,
    relatedAssessments: [
      related(
        "relationship-infatuation-obsession-analysis",
        "Useful if the chapter still feels mentally consuming or emotionally reinforced by ambiguity, longing, or ongoing preoccupation."
      ),
      related(
        "toxic-pattern-and-red-flag-report",
        "Useful if the open chapter is tied to a destabilizing relationship dynamic that still deserves clearer naming.",
        "deepen"
      ),
      related(
        "membership",
        "Membership can later connect closure, attachment, red-flag, and recovery reports into one longer-term relationship insight library.",
        "membership"
      )
    ],
    reportBlueprint: createStandardReportBlueprint({
      assessmentSlug: "closure-and-emotional-recovery-report",
      title: "Closure Insight Report",
      subtitle:
        "A premium report for unresolved attachment, unanswered meaning, replay loops, and the friction of emotional recovery.",
      previewPromises: previewSections(
        "See whether replay, attachment residue, unanswered meaning, release resistance, or future friction is most active right now.",
        "Preview how unfinished emotional attachment and unresolved interpretation appear to be keeping the chapter open."
      ),
      sectionTitles: premiumSectionTitles,
      sectionDescriptions: {
        patternSummary:
          "An early read on the main reason the chapter is still emotionally active.",
        whatResponsesSuggest:
          "Preview-safe interpretation of how replay, attachment, meaning gaps, and forward friction appear to be fitting together.",
        emotionalDrivers:
          "Premium section on lingering bond, unresolved hope, unanswered questions, and the emotional mechanics under the open chapter.",
        dailyLifeImpact:
          "Premium section translating the pattern into attention, mood, future orientation, and ordinary life recovery.",
        blindSpots:
          "Premium section surfacing subtle ways the chapter may still be organizing identity, hope, or interpretation without your full consent.",
        stabilitySuggestions:
          "Premium section for steadier release, more believable recovery, and a clearer relationship to what still matters.",
        relatedInsights:
          "Related assessments and bundle paths that make sense after this closure-pattern result."
      }
    }),
    subscriptionUpsellNote:
      "Strong membership candidate for users likely to revisit attachment, recovery, red-flag, and relationship-pattern reports over time."
  } satisfies AssessmentDefinition;
})();

const additionalAssessments = [
  toxicAssessment,
  emotionalDetachmentAssessment,
  anhedoniaAssessment,
  burnoutAssessment,
  attachmentStyleAssessment,
  identityAssessment,
  closureAssessment
];

export const assessmentDefinitions: AssessmentDefinition[] = [
  condescendingAssessment,
  imposterAssessment,
  infatuationAssessment,
  ...additionalAssessments
];

export const featuredAssessmentSlugs = [
  "condescending-behavior-decoder",
  "imposter-syndrome-deep-report",
  "relationship-infatuation-obsession-analysis"
] as const;

export const deepSeededAssessmentSlugs = assessmentDefinitions
  .filter((assessment) => assessment.buildStatus === "deep_seeded")
  .map((assessment) => assessment.slug);

function getLegacyReportSections(assessment: AssessmentDefinition) {
  const previewSections = assessment.reportBlueprint.sections.filter(
    (section) => section.access === "preview"
  );
  const firstPremiumSection = assessment.reportBlueprint.sections.find(
    (section) => section.access === "premium"
  );

  return [...previewSections.slice(0, 2), ...(firstPremiumSection ? [firstPremiumSection] : [])].map(
    (section) => ({
      title: section.title,
      description: section.description,
      state: section.access === "preview" ? ("open" as const) : ("locked" as const)
    })
  );
}

function getDiscoveryCategories(assessment: AssessmentDefinition) {
  switch (assessment.category) {
    case "Relationship Dynamics":
    case "Attachment":
      return ["Relationships"];
    case "Self-Perception":
      return ["Self-perception"];
    case "Burnout":
      return ["Stress and burnout"];
    case "Identity":
      return ["Identity and direction"];
    case "Recovery":
      return ["Recovery and closure"];
    case "Emotional State":
    case "Motivation":
    default:
      return ["Emotional patterns"];
  }
}

function getSearchKeywords(assessment: AssessmentDefinition) {
  const discoveryMetadata = getAssessmentDiscoveryMetadata(assessment.slug);

  return Array.from(
    new Set(
      [
        assessment.topicKey,
        assessment.category,
        assessment.slug.replaceAll("-", " "),
        ...assessment.categoryTags,
        ...assessment.bundleTags,
        ...assessment.focusAreas,
        ...discoveryMetadata.problemTags,
        ...discoveryMetadata.issuePhrases
      ]
        .join(" ")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    )
  );
}

function toAssessmentSummary(assessment: AssessmentDefinition): Assessment {
  const discoveryMetadata = getAssessmentDiscoveryMetadata(assessment.slug);

  return {
    slug: assessment.slug,
    title: assessment.title,
    category: assessment.category,
    descriptor: assessment.subtitle,
    tagline: assessment.subtitle,
    summary: assessment.targetPainPoint,
    targetPainPoint: assessment.targetPainPoint,
    previewPromise: assessment.previewPromise,
    questionCount: `${assessment.questionCount} questions`,
    timeEstimate: assessment.estimatedTimeLabel,
    privacy: assessment.privacyNote,
    reportLabel: assessment.reportLabel,
    discoveryCategories: getDiscoveryCategories(assessment),
    problemTags: discoveryMetadata.problemTags,
    issuePhrases: discoveryMetadata.issuePhrases,
    searchKeywords: getSearchKeywords(assessment),
    featured: featuredAssessmentSlugs.includes(
      assessment.slug as (typeof featuredAssessmentSlugs)[number]
    ),
    focusPoints: assessment.focusAreas,
    outcomes: assessment.outcomeHighlights,
    reportSections: getLegacyReportSections(assessment),
    recommendedSlugs: assessment.relatedAssessments
      .filter((item) => item.slug !== "membership")
      .map((item) => item.slug),
    buildStatus: assessment.buildStatus
  };
}

export const assessments = assessmentDefinitions.map(toAssessmentSummary);

export function getAssessmentDefinitionBySlug(slug: string) {
  return assessmentDefinitions.find((assessment) => assessment.slug === slug);
}

export function getAssessmentBySlug(slug: string) {
  return assessments.find((assessment) => assessment.slug === slug);
}

export function getAssessmentsBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getAssessmentBySlug(slug))
    .filter((assessment): assessment is Assessment => Boolean(assessment));
}

export function getAssessmentDefinitionsBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getAssessmentDefinitionBySlug(slug))
    .filter((assessment): assessment is AssessmentDefinition => Boolean(assessment));
}
