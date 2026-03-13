export type AssessmentBuildStatus = "deep_seeded" | "metadata_ready";

export type AssessmentQuestionType =
  | "scale"
  | "multiple_choice"
  | "situational"
  | "forced_choice";

export type QuestionScaleKey =
  | "agreement"
  | "frequency"
  | "impact"
  | "truth"
  | "likelihood";

export type ScoreBand = "low" | "moderate" | "elevated" | "high";

export type ReportSectionAccess = "preview" | "premium";

export type ReportGenerationMode = "deterministic" | "ai_ready" | "hybrid";

export type AIProviderMode = "mock" | "openai";

export type AIGenerationStatus =
  | "mock_ready"
  | "generated"
  | "validation_fallback";

export type RecommendationType =
  | "adjacent"
  | "deepen"
  | "stabilize"
  | "membership";

export type ResultTone = "primary" | "secondary" | "protective" | "caution";

export type MatchStrength = "adjacent" | "supporting" | "strong";

export type ReportSectionFormat =
  | "summary"
  | "analysis"
  | "drivers"
  | "impact"
  | "guidance"
  | "cross_sell";

export type ReportContentBlockType =
  | "paragraph"
  | "bullet_list"
  | "signal_grid"
  | "callout"
  | "ai_placeholder";

export type AISectionPromptTemplate =
  | "pattern_summary"
  | "pattern_interpretation"
  | "real_life_expression"
  | "emotional_pressure_points"
  | "hidden_friction_areas"
  | "stability_and_clarity"
  | "related_insight_recommendations";

export type AnswerOption = {
  id: string;
  label: string;
  description?: string;
  value: number;
  dimensionWeights: Record<string, number>;
  contextMarkers?: string[];
};

export type AssessmentQuestion = {
  id: string;
  sectionId: string;
  prompt: string;
  type: AssessmentQuestionType;
  scaleKey?: QuestionScaleKey;
  helperText?: string;
  reverseScored?: boolean;
  optionLayout?: "stack" | "grid";
  dimensionKeys: string[];
  tags?: string[];
  options: AnswerOption[];
};

export type AssessmentSection = {
  id: string;
  title: string;
  description: string;
  intent: string;
  questionIds: string[];
};

export type ScoreDimension = {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  bandDescriptions: Record<ScoreBand, string>;
};

export type RelatedInsightRecommendation = {
  slug: string;
  reason: string;
  recommendationType: RecommendationType;
};

export type RelatedInsightDecision = RelatedInsightRecommendation & {
  matchStrength: MatchStrength;
  clusterKey?: string;
  clusterLabel?: string;
  sourceDimensionKeys?: string[];
  whyNow?: string;
  bundleKey?: string;
  historyNote?: string;
};

export type ReportSectionDefinition = {
  id: string;
  title: string;
  description: string;
  access: ReportSectionAccess;
  generationMode: ReportGenerationMode;
  requiredDimensionKeys: string[];
  narrativeIntent: string;
  placeholderFocus: string[];
};

export type PreviewSectionDefinition = {
  sectionId: string;
  label: string;
  promise: string;
};

export type ReportBlueprint = {
  id: string;
  assessmentSlug: string;
  title: string;
  subtitle: string;
  previewSections: PreviewSectionDefinition[];
  sections: ReportSectionDefinition[];
  lockCtaLabel: string;
};

export type AssessmentDefinition = {
  id: string;
  slug: string;
  topicKey: string;
  title: string;
  subtitle: string;
  category: string;
  buildStatus: AssessmentBuildStatus;
  estimatedTimeMinutes: number;
  estimatedTimeLabel: string;
  questionCount: number;
  privacyNote: string;
  targetPainPoint: string;
  previewPromise: string;
  reportLabel: string;
  focusAreas: string[];
  outcomeHighlights: string[];
  introBullets: string[];
  bundleTags: string[];
  categoryTags: string[];
  dimensions: ScoreDimension[];
  sections: AssessmentSection[];
  questions: AssessmentQuestion[];
  relatedAssessments: RelatedInsightRecommendation[];
  reportBlueprint: ReportBlueprint;
  subscriptionUpsellNote: string;
};

export type DimensionScore = {
  key: string;
  label: string;
  shortLabel: string;
  rawScore: number;
  minScore: number;
  maxScore: number;
  normalizedScore: number;
  band: ScoreBand;
  interpretation: string;
};

export type ResultInsight = {
  id: string;
  title: string;
  body: string;
  tone: ResultTone;
  sourceDimensionKeys: string[];
};

export type ResultTendency = {
  id: string;
  label: string;
  description: string;
  intensityBand: ScoreBand;
  sourceDimensionKeys: string[];
};

export type PatternCluster = {
  id: string;
  label: string;
  description: string;
  intensityBand: ScoreBand;
  sourceDimensionKeys: string[];
};

export type BundleSuggestion = {
  id: string;
  title: string;
  description: string;
  assessmentSlugs: string[];
  rationale: string;
};

export type MembershipUpsellContext = {
  title: string;
  description: string;
  benefits: string[];
};

export type PremiumBoundaryState = {
  previewNarrative: string;
  lockedNarrative: string;
  visibleSectionIds: string[];
  lockedSectionIds: string[];
  lockedSectionTitles: string[];
};

export type AIReportNarrativeRequest = {
  sectionId: string;
  title: string;
  intent: string;
  requiredDimensionKeys: string[];
  anchorSummary: string;
  contextMarkers: string[];
  dominantDimensionKeys: string[];
  dominantDimensionLabels: string[];
  intensitySignal: string;
  requestedWordRange: {
    min: number;
    max: number;
  };
  promptFocus: string[];
};

export type AIReportDimensionSnapshot = {
  key: string;
  label: string;
  shortLabel: string;
  normalizedScore: number;
  band: ScoreBand;
  interpretation: string;
};

export type AIReportTendencySnapshot = {
  label: string;
  description: string;
  intensityBand: ScoreBand;
};

export type AIReportPatternClusterSnapshot = {
  label: string;
  description: string;
  intensityBand: ScoreBand;
};

export type AIReportToneGuardrails = {
  voice: string;
  include: string[];
  avoid: string[];
  uncertaintyStyle: string[];
};

export type AIRecommendationContext = {
  currentAssessmentSlug: string;
  previousReportSlugs: string[];
  dominantDimensionKeys: string[];
  relatedInsightClusters: Array<{
    key: string;
    label: string;
  }>;
  recommendedInsights: Array<{
    slug: string;
    matchStrength: MatchStrength;
    clusterKey?: string;
    clusterLabel?: string;
    reason: string;
    whyNow?: string;
  }>;
  preparedBundleKeys: string[];
};

export type AIReportPromptBundle = {
  sectionId: string;
  title: string;
  template: AISectionPromptTemplate;
  sectionRole: string;
  systemPrompt: string;
  userPrompt: string;
  validationChecklist: string[];
  outputContract: string[];
  groundingSignals: string[];
  groundingEvidence: string[];
  roleBoundaries: string[];
  expectedStructuredFields: string[];
};

export type AIInsightSectionPlan = {
  sectionId: string;
  title: string;
  template: AISectionPromptTemplate;
  retryable: boolean;
  validationFocus: string[];
  outputContract: {
    synopsisRequired: boolean;
    paragraphRange: {
      min: number;
      max: number;
    };
    bulletRange: {
      min: number;
      max: number;
    };
    calloutOptional: boolean;
    requiredFields: string[];
  };
};

export type SubscriptionFollowUpModule = {
  id: string;
  title: string;
  description: string;
  availability: "subscriber_only" | "future";
};

export type SubscriptionFollowUpBlueprint = {
  title: string;
  description: string;
  modules: SubscriptionFollowUpModule[];
  reflectionThemes: string[];
  comparisonNarrativeIntent: string;
};

export type AIReportInputPayload = {
  assessmentId: string;
  assessmentSlug: string;
  assessmentTitle: string;
  assessmentSubtitle: string;
  topicKey: string;
  sourceOfTruth: "deterministic_scoring";
  aiRole: "narrative_interpretation";
  reportBlueprintId: string;
  reportTitle: string;
  reportSubtitle: string;
  targetPainPoint: string;
  resultSummary: {
    label: string;
    title: string;
    narrative: string;
    descriptor: string;
  };
  previewInsightSummary: string;
  dominantDimensions: AIReportDimensionSnapshot[];
  secondaryDimensions: AIReportDimensionSnapshot[];
  dimensionSnapshot: AIReportDimensionSnapshot[];
  dominantTendencies: AIReportTendencySnapshot[];
  stabilizingTendencies: AIReportTendencySnapshot[];
  protectiveTendencies: AIReportTendencySnapshot[];
  tensionAreas: AIReportTendencySnapshot[];
  contextMarkers: string[];
  previewHighlights: string[];
  previewInsights: Array<{
    title: string;
    body: string;
    tone: ResultTone;
  }>;
  patternClusters: AIReportPatternClusterSnapshot[];
  bundleContext: BundleSuggestion | null;
  membershipContext: MembershipUpsellContext;
  recommendationContext: AIRecommendationContext;
  followUpBlueprint: SubscriptionFollowUpBlueprint;
  toneRequirements: string[];
  safetyInstructions: string[];
  safetyGuardrails: AIReportToneGuardrails;
  sectionGenerationPlan: AIInsightSectionPlan[];
  narrativeSectionsToGenerate: AIReportNarrativeRequest[];
};

export type AIGeneratedNarrativeSection = {
  id: string;
  sectionId: string;
  title: string;
  providerMode: AIProviderMode;
  status: AIGenerationStatus;
  synopsis: string;
  paragraphs: string[];
  bullets: string[];
  callout?: string;
  promptBundle: AIReportPromptBundle;
  validationNotes: string[];
};

export type AIReportAssemblyMeta = {
  engineName: string;
  engineVersion: string;
  narrativeMode: AIProviderMode;
  generatedAt: string;
  narrativeSectionCount: number;
  validatedSectionCount: number;
  sectionGenerationMode: "sectional";
  followUpReady: boolean;
  validationState: "ready";
};

export type AssessmentResultProfile = {
  assessmentId: string;
  assessmentSlug: string;
  topicKey: string;
  answeredCount: number;
  totalQuestions: number;
  completionPercent: number;
  dimensionScores: DimensionScore[];
  dominantDimensionKeys: string[];
  supportingDimensionKeys: string[];
  contextMarkers: string[];
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
  visiblePreviewSectionIds: string[];
  lockedSectionIds: string[];
  relatedRecommendations: RelatedInsightDecision[];
  bundleSuggestion: BundleSuggestion | null;
  membershipUpsell: MembershipUpsellContext;
  aiPayload: AIReportInputPayload;
};

export type ReportBlockMetric = {
  label: string;
  value: string;
  band?: ScoreBand;
};

export type ReportContentBlock = {
  id: string;
  type: ReportContentBlockType;
  label?: string;
  content?: string;
  items?: string[];
  metrics?: ReportBlockMetric[];
  visibility?: "all" | "full_report_only";
};

export type ComposedReportSection = {
  id: string;
  title: string;
  description: string;
  sectionIntro: string;
  access: ReportSectionAccess;
  state: "visible" | "locked";
  generationMode: ReportGenerationMode;
  formatStyle: ReportSectionFormat;
  narrativeIntent: string;
  requiredDimensionKeys: string[];
  overview: string;
  previewTeaser: string;
  blocks: ReportContentBlock[];
};

export type PremiumReport = {
  assessmentSlug: string;
  assessmentTitle: string;
  title: string;
  subtitle: string;
  summaryLabel: string;
  summaryTitle: string;
  summaryNarrative: string;
  previewInsights: ResultInsight[];
  dominantTendencies: ResultTendency[];
  protectiveTendencies: ResultTendency[];
  frictionAreas: ResultTendency[];
  patternClusters: PatternCluster[];
  sections: ComposedReportSection[];
  visibleSections: ComposedReportSection[];
  lockedSections: ComposedReportSection[];
  relatedRecommendations: RelatedInsightDecision[];
  bundleSuggestion: BundleSuggestion | null;
  membershipUpsell: MembershipUpsellContext;
  lockCtaLabel: string;
  pdfOutline: {
    title: string;
    bookmarkTitles: string[];
    plannedPageCount: number;
  };
  aiPayload: AIReportInputPayload;
  aiNarrativeSections: AIGeneratedNarrativeSection[];
  subscriptionFollowUp: SubscriptionFollowUpBlueprint;
  assemblyMeta: AIReportAssemblyMeta;
};
