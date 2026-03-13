import { getAssessmentBySlug } from "@/lib/assessments";

import {
  getInsightAssessmentLibraryPath,
  getInsightAssessmentLibraryUrl,
  getInsightAssessmentPath,
  getInsightAssessmentUrl,
  normalizeInsightBaseUrl,
  DEFAULT_INSIGHT_BASE_URL
} from "@/lib/blog-popup/routing";
import type {
  BlogPopupFallbackDefinition,
  BlogPopupScriptConfig,
  BlogTopicMapping,
  BlogTopicMappingDefinition
} from "@/lib/blog-popup/types";

export const BLOG_POPUP_DELAY_MS = 35000;
export const BLOG_POPUP_SESSION_KEY = "click2pro-insight-popup-seen-v1";
export const BLOG_ARTICLE_PATH_HINTS = [
  "/blog/",
  "/blogs/",
  "/psychology/",
  "/relationships/",
  "/dating/",
  "/self-awareness/",
  "/mental-health/"
];

function createMapping(
  definition: BlogTopicMappingDefinition
): BlogTopicMapping {
  const assessment = getAssessmentBySlug(definition.assessmentSlug);

  if (!assessment) {
    throw new Error(
      `Missing assessment summary for blog popup mapping: ${definition.assessmentSlug}`
    );
  }

  return {
    ...definition,
    assessmentTitle: assessment.title,
    timeEstimate: assessment.timeEstimate,
    privacyNote: assessment.privacy,
    reportLabel: assessment.reportLabel,
    routePath: getInsightAssessmentPath(assessment.slug),
    ctaLabel: definition.ctaLabel ?? "Start assessment",
    badgeLabel: definition.badgeLabel ?? "Relevant assessment"
  };
}

export const blogPopupFallback: BlogPopupFallbackDefinition = {
  title: "Behavioral Insight Assessments",
  topicLabel: "General insight library",
  message:
    "Explore your behavioral patterns through our structured insight assessments. Start with the topic that feels most active right now, then review a calm preview before deciding whether to go deeper.",
  ctaLabel: "Browse assessments",
  badgeLabel: "Insight library",
  routePath: getInsightAssessmentLibraryPath()
};

export const blogTopicMappings = [
  createMapping({
    assessmentSlug: "condescending-behavior-decoder",
    topicLabel: "Condescending or patronizing behavior",
    urlFragments: [
      "condescending",
      "patronizing",
      "belittling",
      "talking-down",
      "talk down",
      "superiority"
    ],
    keywords: [
      "condescending",
      "patronizing",
      "belittling",
      "talking down",
      "superior tone",
      "dismissive behavior",
      "subtle disrespect"
    ],
    contextualMessage:
      "This article touches on behavior that can be hard to name clearly while it is happening. If you want a more structured read on whether a dismissive or subtly superior dynamic is active in your own experience, you can explore it through a short assessment.",
    priority: 3
  }),
  createMapping({
    assessmentSlug: "imposter-syndrome-deep-report",
    topicLabel: "Imposter feelings and competence doubt",
    urlFragments: [
      "imposter-syndrome",
      "impostor-syndrome",
      "self-doubt",
      "fraud-feeling",
      "not-good-enough"
    ],
    keywords: [
      "imposter syndrome",
      "impostor syndrome",
      "self doubt",
      "fraud feeling",
      "not good enough",
      "despite competence",
      "achievement pressure"
    ],
    contextualMessage:
      "If this article reflects the way self-doubt stays active even after real achievement, the assessment can help clarify how pressure, exposure sensitivity, and comparison are showing up in your own responses.",
    priority: 3
  }),
  createMapping({
    assessmentSlug: "relationship-infatuation-obsession-analysis",
    topicLabel: "Infatuation, obsession, or limerence patterns",
    urlFragments: [
      "infatuation",
      "obsession",
      "limerence",
      "mixed-signals",
      "cant-stop-thinking",
      "can-not-stop-thinking"
    ],
    keywords: [
      "infatuation",
      "obsession",
      "limerence",
      "mixed signals",
      "cant stop thinking",
      "cannot stop thinking",
      "emotional preoccupation",
      "relationship obsession"
    ],
    contextualMessage:
      "This topic often feels less like clear romance and more like mental occupancy, mixed-signal sensitivity, and difficulty creating distance. The assessment helps map how intense that loop currently is.",
    priority: 4
  }),
  createMapping({
    assessmentSlug: "toxic-pattern-and-red-flag-report",
    topicLabel: "Toxic patterns and red-flag dynamics",
    urlFragments: [
      "toxic-relationship",
      "red-flags",
      "manipulation",
      "gaslighting",
      "unhealthy-patterns"
    ],
    keywords: [
      "toxic relationship",
      "red flags",
      "manipulation",
      "gaslighting",
      "warning signs",
      "unhealthy pattern",
      "control dynamic"
    ],
    contextualMessage:
      "If this article is bringing up confusing or destabilizing relational patterns, the assessment can help organize what feels like warning signs versus what keeps you second-guessing them.",
    priority: 3
  }),
  createMapping({
    assessmentSlug: "emotional-detachment-nihilism-insight",
    topicLabel: "Emotional detachment or nihilistic flattening",
    urlFragments: [
      "emotionally-detached",
      "emotional-detachment",
      "nihilism",
      "numb",
      "empty-inside"
    ],
    keywords: [
      "emotionally detached",
      "emotional detachment",
      "nihilism",
      "numb",
      "empty inside",
      "feel nothing",
      "disconnected from life"
    ],
    contextualMessage:
      "If the article reflects a flatter or more distant inner state than you usually show outwardly, the assessment can help surface how numbness, disconnection, and meaning loss are interacting.",
    priority: 2
  }),
  createMapping({
    assessmentSlug: "anhedonia-and-motivation-pattern-scan",
    topicLabel: "Low motivation or reduced enjoyment",
    urlFragments: [
      "anhedonia",
      "no-motivation",
      "nothing-feels-good",
      "lost-interest",
      "motivation"
    ],
    keywords: [
      "anhedonia",
      "no motivation",
      "nothing feels good",
      "lost interest",
      "hard to enjoy things",
      "motivation slump",
      "low drive"
    ],
    contextualMessage:
      "If this article sounds familiar because motivation feels thin and enjoyment has become harder to access, the assessment helps clarify whether the pattern is more about depletion, emotional flattening, or stalled momentum.",
    priority: 2
  }),
  createMapping({
    assessmentSlug: "personality-burnout-and-stress-report",
    topicLabel: "Burnout, strain, and recovery difficulty",
    urlFragments: [
      "burnout",
      "stress",
      "high-functioning-exhaustion",
      "always-tired",
      "overwhelmed"
    ],
    keywords: [
      "burnout",
      "stress",
      "always tired",
      "overwhelmed",
      "exhausted",
      "high functioning exhaustion",
      "recovery difficulty"
    ],
    contextualMessage:
      "If pressure and exhaustion keep blending together, the assessment helps map how strain, recovery difficulty, and performance style may be reinforcing each other.",
    priority: 2
  }),
  createMapping({
    assessmentSlug: "attachment-and-relationship-style-report",
    topicLabel: "Attachment style and closeness-distance patterns",
    urlFragments: [
      "attachment-style",
      "anxious-attachment",
      "avoidant",
      "relationship-style",
      "disorganized-attachment"
    ],
    keywords: [
      "attachment style",
      "anxious attachment",
      "avoidant attachment",
      "disorganized attachment",
      "relationship style",
      "closeness distance",
      "fear of abandonment"
    ],
    contextualMessage:
      "If the article reflects recurring closeness-distance patterns, the assessment can help translate that into a clearer relationship-style profile rather than a vague label.",
    priority: 3
  }),
  createMapping({
    assessmentSlug: "identity-and-inner-conflict-profile",
    topicLabel: "Identity tension and inner conflict",
    urlFragments: [
      "identity-crisis",
      "inner-conflict",
      "sense-of-self",
      "who-am-i",
      "identity"
    ],
    keywords: [
      "identity crisis",
      "inner conflict",
      "sense of self",
      "who am i",
      "self conflict",
      "mixed self concept",
      "direction confusion"
    ],
    contextualMessage:
      "If the article brings up self-conflict, inconsistency, or difficulty trusting your own direction, the assessment helps map where the tension is really concentrated.",
    priority: 2
  }),
  createMapping({
    assessmentSlug: "closure-and-emotional-recovery-report",
    topicLabel: "Closure and emotional recovery",
    urlFragments: [
      "closure",
      "moving-on",
      "letting-go",
      "emotional-recovery",
      "breakup"
    ],
    keywords: [
      "closure",
      "moving on",
      "letting go",
      "emotional recovery",
      "unfinished breakup",
      "still attached",
      "cannot move on"
    ],
    contextualMessage:
      "If moving on still feels unfinished, the assessment helps identify whether the pattern is being held in place by unanswered meaning, lingering attachment, or recovery resistance.",
    priority: 2
  })
] as const;

export function getBlogPopupScriptConfig(
  insightBaseUrl = DEFAULT_INSIGHT_BASE_URL
): BlogPopupScriptConfig {
  const normalizedBaseUrl = normalizeInsightBaseUrl(insightBaseUrl);

  return {
    delayMs: BLOG_POPUP_DELAY_MS,
    sessionKey: BLOG_POPUP_SESSION_KEY,
    insightBaseUrl: normalizedBaseUrl,
    articlePathHints: BLOG_ARTICLE_PATH_HINTS,
    fallback: {
      ...blogPopupFallback,
      href: getInsightAssessmentLibraryUrl(normalizedBaseUrl)
    },
    mappings: blogTopicMappings.map((mapping) => ({
      ...mapping,
      href: getInsightAssessmentUrl(mapping.assessmentSlug, normalizedBaseUrl)
    }))
  };
}
