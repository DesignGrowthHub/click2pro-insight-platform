export type BlogTopicMatchMode = "slug" | "keyword" | "fallback";

export type BlogTopicMappingDefinition = {
  assessmentSlug: string;
  topicLabel: string;
  urlFragments: string[];
  keywords: string[];
  contextualMessage: string;
  ctaLabel?: string;
  badgeLabel?: string;
  priority?: number;
};

export type BlogTopicMapping = BlogTopicMappingDefinition & {
  assessmentTitle: string;
  timeEstimate: string;
  privacyNote: string;
  reportLabel: string;
  routePath: string;
  ctaLabel: string;
  badgeLabel: string;
};

export type BlogPopupFallbackDefinition = {
  title: string;
  topicLabel: string;
  message: string;
  ctaLabel: string;
  badgeLabel: string;
  routePath: string;
};

export type BlogPopupFallback = BlogPopupFallbackDefinition & {
  href: string;
};

export type BlogTopicDetectionInput = {
  url: string;
  pageTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  insightBaseUrl?: string;
};

export type BlogTopicDetectionResult = {
  kind: "assessment" | "fallback";
  matchedBy: BlogTopicMatchMode;
  href: string;
  title: string;
  topicLabel: string;
  message: string;
  ctaLabel: string;
  badgeLabel: string;
  matchedTerms: string[];
  score: number;
  assessmentSlug?: string;
  timeEstimate?: string;
  privacyNote?: string;
  reportLabel?: string;
};

export type BlogPopupScriptMapping = BlogTopicMapping & {
  href: string;
};

export type BlogPopupScriptConfig = {
  delayMs: number;
  sessionKey: string;
  insightBaseUrl: string;
  articlePathHints: string[];
  fallback: BlogPopupFallback;
  mappings: BlogPopupScriptMapping[];
};
