import type {
  AssessmentResultProfile,
  MembershipUpsellContext,
  PremiumBoundaryState,
  PremiumReport,
  SubscriptionFollowUpBlueprint
} from "@/lib/types/assessment-domain";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function hasPremiumBoundaryShape(value: unknown): value is PremiumBoundaryState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.previewNarrative === "string" &&
    typeof value.lockedNarrative === "string" &&
    isStringArray(value.visibleSectionIds) &&
    isStringArray(value.lockedSectionIds) &&
    isStringArray(value.lockedSectionTitles)
  );
}

function hasMembershipUpsellShape(value: unknown): value is MembershipUpsellContext {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    isStringArray(value.benefits)
  );
}

function hasSubscriptionFollowUpShape(
  value: unknown
): value is SubscriptionFollowUpBlueprint {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.modules) &&
    isStringArray(value.reflectionThemes) &&
    typeof value.comparisonNarrativeIntent === "string"
  );
}

export function isAssessmentResultProfile(
  value: unknown
): value is AssessmentResultProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.assessmentSlug === "string" &&
    typeof value.summaryLabel === "string" &&
    typeof value.summaryNarrative === "string" &&
    typeof value.summaryDescriptor === "string" &&
    Array.isArray(value.dimensionScores) &&
    Array.isArray(value.previewInsights) &&
    Array.isArray(value.dominantTendencies) &&
    Array.isArray(value.protectiveTendencies) &&
    Array.isArray(value.frictionAreas) &&
    Array.isArray(value.patternClusters) &&
    Array.isArray(value.relatedRecommendations) &&
    Array.isArray(value.visiblePreviewSectionIds) &&
    Array.isArray(value.lockedSectionIds) &&
    hasPremiumBoundaryShape(value.premiumBoundary) &&
    hasMembershipUpsellShape(value.membershipUpsell)
  );
}

export function parseAssessmentResultProfile(value: unknown) {
  return isAssessmentResultProfile(value) ? value : null;
}

export function isPremiumReport(value: unknown): value is PremiumReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.assessmentSlug === "string" &&
    typeof value.title === "string" &&
    typeof value.summaryLabel === "string" &&
    Array.isArray(value.sections) &&
    Array.isArray(value.visibleSections) &&
    Array.isArray(value.lockedSections) &&
    Array.isArray(value.previewInsights) &&
    Array.isArray(value.aiNarrativeSections) &&
    Array.isArray(value.relatedRecommendations) &&
    hasMembershipUpsellShape(value.membershipUpsell) &&
    hasSubscriptionFollowUpShape(value.subscriptionFollowUp) &&
    isRecord(value.pdfOutline)
  );
}

export function parsePremiumReport(value: unknown) {
  return isPremiumReport(value) ? value : null;
}
