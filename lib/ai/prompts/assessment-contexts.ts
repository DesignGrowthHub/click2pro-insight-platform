import type { AISectionPromptTemplate } from "@/lib/types/assessment-domain";

export type AssessmentPromptContext = {
  interpretiveLens: string;
  relatedInsightFrame: string;
  subscriberValueFrame: string;
  contextPriorities: string[];
  sectionInstructions: Partial<Record<string, string[]>>;
  sectionTemplates?: Partial<Record<string, AISectionPromptTemplate>>;
};

const defaultContext: AssessmentPromptContext = {
  interpretiveLens:
    "Interpret recurring behavioral patterns with psychological precision while staying non-clinical, calm, and bounded to the assessment responses.",
  relatedInsightFrame:
    "Related insight suggestions should feel connected to the current scored pattern, not like generic add-ons.",
  subscriberValueFrame:
    "Future subscription value should emphasize pattern tracking, connected-report interpretation, and ongoing reflection rather than generic membership language.",
  contextPriorities: [
    "translate scored patterns into lived behavior",
    "keep ambiguity visible where certainty would overreach",
    "make the report feel observant without sounding clinical"
  ],
  sectionInstructions: {}
};

const assessmentContexts: Record<string, AssessmentPromptContext> = {
  "condescending-behavior-decoder": {
    interpretiveLens:
      "Interpret subtle interpersonal power dynamics, dismissive delivery, emotional invalidation, and the strain created when proof stays less visible than impact.",
    relatedInsightFrame:
      "Keep adjacent recommendations in relational-dynamics territory: red flags, attachment style, closure, and recurring boundary strain.",
    subscriberValueFrame:
      "Subscriber follow-up should feel useful for users comparing repeated interaction patterns, evolving self-trust, and future boundary interpretation.",
    contextPriorities: [
      "interpersonal power shifts",
      "deniability versus impact",
      "boundary strain and self-editing"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Translate the result into how someone may interpret tone, status shifts, or credibility pressure in real interactions."
      ],
      "emotional-drivers": [
        "Explain why dismissive behavior can remain emotionally potent even when it stays deniable."
      ],
      "blind-spots-or-tension-areas": [
        "Surface the tension between waiting for proof and already feeling the cost."
      ],
      "stability-suggestions": [
        "Focus on self-trust, boundary clarity, and pattern recognition rather than advice that sounds therapeutic."
      ]
    }
  },
  "imposter-syndrome-deep-report": {
    interpretiveLens:
      "Interpret competence doubt, exposure sensitivity, comparison pressure, overpreparation, and the gap between external evidence and internal permission.",
    relatedInsightFrame:
      "Related insight suggestions should stay close to performance strain, identity tension, motivation drag, or burnout if they deepen the same pressure system.",
    subscriberValueFrame:
      "Subscriber value should feel strongest around longitudinal pressure tracking, evidence integration, and what changes after specific work cycles or visibility moments.",
    contextPriorities: [
      "self-doubt intensity",
      "fear of exposure",
      "comparison and internal pressure"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Show how competence can coexist with a fragile sense of legitimacy."
      ],
      "emotional-drivers": [
        "Explain how internal pressure can disguise itself as professionalism or diligence."
      ],
      "daily-life-impact": [
        "Translate the pattern into work rhythm, praise resistance, and post-success tension."
      ],
      "stability-suggestions": [
        "Keep guidance focused on evidence integration, comparison boundaries, and sustainable performance."
      ]
    }
  },
  "relationship-infatuation-obsession-analysis": {
    interpretiveLens:
      "Interpret emotional preoccupation, mixed-signal sensitivity, attachment intensity, reassurance-seeking, private storyline building, and difficulty creating clarity or distance.",
    relatedInsightFrame:
      "Related recommendations should stay relational: attachment style, closure, red-flag interpretation, and repeated loop recognition.",
    subscriberValueFrame:
      "Subscriber value should emphasize comparing future attachment loops, noticing what changed after distance, and tracking whether life is coming back into focus.",
    contextPriorities: [
      "mixed-signal sensitivity",
      "mental occupancy and checking",
      "clarity versus fantasy"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Distinguish attachment to the person from attachment to the unresolved storyline."
      ],
      "emotional-drivers": [
        "Explain how ambiguity can reinforce the loop rather than simply frustrate it."
      ],
      "daily-life-impact": [
        "Translate the pattern into attention drift, mood dependence, and reduced room for ordinary life."
      ],
      "stability-suggestions": [
        "Ground the section in clarity, distance, and attention recovery without sounding harsh or abrupt."
      ]
    }
  },
  "toxic-pattern-and-red-flag-report": {
    interpretiveLens:
      "Interpret destabilizing relationship patterns through boundary tolerance, rationalization, emotional dependency, warning-signal override, and conflict avoidance.",
    relatedInsightFrame:
      "Related reports should help separate relationship danger signals from attachment style, closure difficulty, or other relational loops.",
    subscriberValueFrame:
      "Subscriber value should center on comparing relationship patterns across time so warning signals become easier to trust and name.",
    contextPriorities: [
      "boundary pressure",
      "rationalizing harmful behavior",
      "clarity delayed by relationship cost"
    ],
    sectionInstructions: {
      "emotional-drivers": [
        "Explain how intermittent warmth, obligation pressure, or fear of rupture can keep harmful dynamics harder to exit."
      ],
      "blind-spots-or-tension-areas": [
        "Surface how rationalization and emotional dependency can blur red-flag recognition."
      ]
    }
  },
  "emotional-detachment-nihilism-insight": {
    interpretiveLens:
      "Interpret emotional disengagement, meaning erosion, motivational flattening, social withdrawal, and the sense of moving through life with reduced felt connection.",
    relatedInsightFrame:
      "Related reports should connect meaning loss to motivation patterns, identity conflict, or burnout when those links are supported by the scored profile.",
    subscriberValueFrame:
      "Subscriber value should feel strongest around comparing emotional range, social reentry, and whether meaning fatigue is easing or spreading.",
    contextPriorities: [
      "emotional disengagement",
      "meaning erosion",
      "low pull toward life"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Keep the interpretation serious and calm without dramatizing emptiness."
      ],
      "daily-life-impact": [
        "Translate the pattern into social distance, muted reaction, and reduced felt significance."
      ],
      "stability-suggestions": [
        "Offer reflective, non-clinical language around re-entry, contact, and making experience feel more reachable again."
      ]
    }
  },
  "anhedonia-and-motivation-pattern-scan": {
    interpretiveLens:
      "Interpret reward dulling, anticipation loss, effort resistance, emotional flattening, and the strain of trying to function when momentum no longer arrives naturally.",
    relatedInsightFrame:
      "Related reports should clarify whether the same low-pull pattern overlaps more with burnout, detachment, or identity drag.",
    subscriberValueFrame:
      "Subscriber value should emphasize seeing whether anticipation, effort, and emotional reward shift over time rather than treating motivation as all-or-nothing.",
    contextPriorities: [
      "reduced reward sensitivity",
      "future anticipation loss",
      "effort resistance"
    ],
    sectionInstructions: {
      "emotional-drivers": [
        "Explain how low reward and high effort can create a self-reinforcing loop without implying pathology."
      ],
      "daily-life-impact": [
        "Translate the pattern into task initiation, flat enjoyment, and weakened recovery from better moments."
      ]
    }
  },
  "personality-burnout-and-stress-report": {
    interpretiveLens:
      "Interpret sustained pressure, recovery difficulty, cognitive overload, emotional depletion, and the brittle functioning that can emerge under chronic strain.",
    relatedInsightFrame:
      "Related reports should connect burnout strain to imposter pressure, motivation flattening, or identity burden when that produces a more coherent pattern map.",
    subscriberValueFrame:
      "Subscriber value should feel useful for comparing recovery, overload, and pressure drift across work cycles or demanding periods.",
    contextPriorities: [
      "sustained pressure",
      "recovery difficulty",
      "cognitive overload"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Frame the result as a pressure pattern, not a badge of productivity or a diagnosis."
      ],
      "daily-life-impact": [
        "Translate the pattern into mental load, shortened patience, and difficulty actually resetting."
      ],
      "stability-suggestions": [
        "Keep suggestions focused on steadiness, load recognition, and recovery permission."
      ]
    }
  },
  "attachment-and-relationship-style-report": {
    interpretiveLens:
      "Interpret reassurance sensitivity, abandonment fear, emotional guarding, independence tension, and the broader regulation style carried into relationships.",
    relatedInsightFrame:
      "Related reports should deepen attachment loops, red-flag confusion, or closure difficulty when those are the most logical adjacent patterns.",
    subscriberValueFrame:
      "Subscriber value should emphasize mapping relationship style across multiple dynamics, not treating one bond as the whole story.",
    contextPriorities: [
      "relationship regulation",
      "closeness versus protection",
      "repair and uncertainty sensitivity"
    ],
    sectionInstructions: {
      "emotional-drivers": [
        "Show how reassurance, protection, and fear of loss can coexist in the same style."
      ],
      "blind-spots-or-tension-areas": [
        "Surface how pursuit and withdrawal can both be serving regulation."
      ]
    }
  },
  "identity-and-inner-conflict-profile": {
    interpretiveLens:
      "Interpret value misalignment, unstable self-recognition, external expectation pressure, decision hesitation, and conflict between competing identity narratives.",
    relatedInsightFrame:
      "Related reports should stay close to identity, meaning, confidence, and emotional-state patterns that explain the same internal split from another angle.",
    subscriberValueFrame:
      "Subscriber value should emphasize seeing whether identity conflict is resolving, relocating, or becoming easier to act on over time.",
    contextPriorities: [
      "value misalignment",
      "role pressure",
      "internal narrative conflict"
    ],
    sectionInstructions: {
      "what-responses-suggest": [
        "Interpret the conflict as a structured inner split, not vague indecision."
      ],
      "daily-life-impact": [
        "Translate the pattern into role strain, delayed action, and internal editing."
      ],
      "stability-suggestions": [
        "Keep guidance around permission, coherence, and alignment without sounding prescriptive."
      ]
    }
  },
  "closure-and-emotional-recovery-report": {
    interpretiveLens:
      "Interpret unresolved attachment, replay loops, unanswered meaning, release resistance, and the friction of trying to move into a next chapter that still does not feel fully open.",
    relatedInsightFrame:
      "Related insight suggestions should stay close to attachment loops, toxic dynamics, or broader relationship patterns that clarify why closure has stayed difficult.",
    subscriberValueFrame:
      "Subscriber value should emphasize comparing recovery over time, what reopened the chapter, and whether forward movement is becoming more believable.",
    contextPriorities: [
      "replay and unfinished meaning",
      "bond residue",
      "forward movement friction"
    ],
    sectionInstructions: {
      "emotional-drivers": [
        "Explain how unanswered meaning and unresolved attachment can both keep the chapter active."
      ],
      "daily-life-impact": [
        "Translate the pattern into replay, comparison to the present, and future hesitation."
      ],
      "stability-suggestions": [
        "Offer grounded language around release, narrative settling, and making the next chapter more inhabitable."
      ]
    }
  }
};

export function getAssessmentPromptContext(
  assessmentSlug: string
): AssessmentPromptContext {
  return assessmentContexts[assessmentSlug] ?? defaultContext;
}

