import type {
  AccessState,
  CommerceState,
  OwnedReport
} from "@/lib/commerce/types";

export function getOwnedReportBySlug(
  state: CommerceState,
  assessmentSlug: string
): OwnedReport | null {
  return (
    state.ownedReports.find((report) => report.assessmentSlug === assessmentSlug) ?? null
  );
}

export function doesUserOwnReport(
  state: CommerceState,
  assessmentSlug: string
) {
  return Boolean(getOwnedReportBySlug(state, assessmentSlug));
}

export function isAssessmentUnlockedBySubscription(
  state: CommerceState,
  assessmentSlug: string
) {
  return state.subscriptions.some(
    (subscription) =>
      (subscription.status === "active" || subscription.status === "trialing") &&
      subscription.unlockedAssessmentSlugs.includes(assessmentSlug)
  );
}

export function isAssessmentUnlockedByBundle(
  state: CommerceState,
  assessmentSlug: string
) {
  return state.ownedBundles.some(
    (bundle) =>
      bundle.accessStatus === "active" &&
      bundle.includedAssessmentSlugs.includes(assessmentSlug)
  );
}

export function shouldShowLockedSections(access: AccessState) {
  return access.shouldShowLockedSections;
}

export function getExplanationEntitlementsForAssessment(
  state: CommerceState,
  assessmentSlug: string
) {
  return state.explanationEntitlements.filter(
    (entitlement) =>
      entitlement.assessmentSlug === assessmentSlug &&
      [
        "pending",
        "granted",
        "ready_for_contact",
        "contacted",
        "scheduled",
        "completed"
      ].includes(entitlement.status)
  );
}

export function getAccessStateForAssessment(
  state: CommerceState,
  assessmentSlug: string
): AccessState {
  const ownedReport = getOwnedReportBySlug(state, assessmentSlug);
  const unlockedBySubscription = isAssessmentUnlockedBySubscription(
    state,
    assessmentSlug
  );
  const unlockedByBundle = isAssessmentUnlockedByBundle(state, assessmentSlug);
  const explanationEntitlements = getExplanationEntitlementsForAssessment(
    state,
    assessmentSlug
  );
  const explanationSessionDurations = explanationEntitlements
    .map((entitlement) => entitlement.durationMinutes)
    .filter(
      (duration, index, durations): duration is 30 | 60 =>
        (duration === 30 || duration === 60) && durations.indexOf(duration) === index
    );

  if (ownedReport && ownedReport.unlock.fullReportVisible) {
    return {
      assessmentSlug,
      status: "owned_report",
      canAccessFullReport: true,
      previewOnly: false,
      hasOwnedReport: true,
      unlockedByBundle,
      unlockedBySubscription,
      hasExplanationEntitlement: explanationSessionDurations.length > 0,
      explanationSessionDurations,
      shouldShowLockedSections: false,
      reasonLabel: "This report is already owned and saved in the dashboard."
    };
  }

  if (unlockedBySubscription) {
    return {
      assessmentSlug,
      status: "subscription_access",
      canAccessFullReport: true,
      previewOnly: false,
      hasOwnedReport: Boolean(ownedReport),
      unlockedByBundle,
      unlockedBySubscription: true,
      hasExplanationEntitlement: explanationSessionDurations.length > 0,
      explanationSessionDurations,
      shouldShowLockedSections: false,
      reasonLabel:
        "This assessment is available through the active membership structure."
    };
  }

  if (unlockedByBundle) {
    return {
      assessmentSlug,
      status: "bundle_access",
      canAccessFullReport: true,
      previewOnly: false,
      hasOwnedReport: Boolean(ownedReport),
      unlockedByBundle: true,
      unlockedBySubscription,
      hasExplanationEntitlement: explanationSessionDurations.length > 0,
      explanationSessionDurations,
      shouldShowLockedSections: false,
      reasonLabel:
        "This assessment sits inside a purchased bundle and is prepared for owned access."
    };
  }

  return {
    assessmentSlug,
    status: "preview_only",
    canAccessFullReport: false,
    previewOnly: true,
    hasOwnedReport: false,
    unlockedByBundle: false,
    unlockedBySubscription: false,
    hasExplanationEntitlement: explanationSessionDurations.length > 0,
    explanationSessionDurations,
    shouldShowLockedSections: true,
    reasonLabel: "Preview is available, but the full report has not been purchased yet."
  };
}
