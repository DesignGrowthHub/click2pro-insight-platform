import "server-only";

import type {
  ReportStatus as PrismaReportStatus,
  Prisma
} from "@prisma/client";

import { getConfiguredAIReportProvider } from "@/lib/ai/reporting/provider-factory";
import { prisma } from "@/lib/db/prisma";
import {
  parseAssessmentResultProfile,
  parsePremiumReport
} from "@/lib/reports/report-integrity";
import { assemblePremiumReport, assemblePremiumReportWithProvider } from "@/lib/report-assembly/premium-report-assembly";
import {
  scoreAssessment,
  type AssessmentResponseMap
} from "@/lib/scoring/assessment-scoring";
import { ensureOwnedReportPdfAsset } from "@/lib/server/services/report-assets";
import {
  getLatestCompletedAssessmentSessionForAnonymousVisitor,
  getLatestCompletedAssessmentSessionForUser,
  saveCompletedAssessmentSession,
  updateAssessmentSessionById
} from "@/lib/server/services/assessment-sessions";
import { getRuntimeAssessmentDefinitionBySlug } from "@/lib/server/services/published-assessments";
import { processQueuedAccountEmailDelivery } from "@/lib/server/services/report-deliveries";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { getOwnedReportBySlug, updateReportById } from "@/lib/server/services/reports";
import type {
  AssessmentDefinition,
  AssessmentResultProfile,
  PremiumReport
} from "@/lib/types/assessment-domain";

type PersistedOutcomeSource = "saved_session" | "saved_report";
type SavedReportGenerationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed"
  | "requires_retry";

export type PersistedAssessmentOutcome = {
  source: "saved_session";
  sessionId: string;
  anonymousVisitorId: string | null;
  completedAt: string | null;
  resultProfile: AssessmentResultProfile;
  premiumReport: PremiumReport;
};

export type PersistedGeneratedReport = {
  source: "saved_report";
  reportId: string;
  sessionId: string | null;
  generationStatus: SavedReportGenerationStatus;
  failureReason: string | null;
  generatedAt: string | null;
  resultProfile: AssessmentResultProfile | null;
  premiumReport: PremiumReport | null;
};

export type PersistedReportExperience =
  | PersistedAssessmentOutcome
  | PersistedGeneratedReport;

type PersistCompletedAssessmentInput = {
  assessment: AssessmentDefinition;
  answers: AssessmentResponseMap;
  userId?: string | null;
  anonymousVisitorId?: string | null;
  sourceAttributionId?: string | null;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
};

type StoredAssessmentSessionShape = {
  id: string;
  anonymousVisitorId: string | null;
  assessmentSlug: string;
  answers: unknown;
  resultProfile: unknown;
  completedAt: Date | null;
};

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseJsonObject<T>(value: unknown): T | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as T;
}

function mapReportStatus(status: PrismaReportStatus): SavedReportGenerationStatus {
  switch (status) {
    case "READY":
      return "completed";
    case "GENERATING":
      return "generating";
    case "FAILED":
      return "failed";
    case "REQUIRES_RETRY":
      return "requires_retry";
    case "QUEUED":
      return "pending";
    case "ARCHIVED":
    default:
      return "failed";
  }
}

function buildScoringSnapshot(resultProfile: AssessmentResultProfile) {
  return {
    completionPercent: resultProfile.completionPercent,
    answeredCount: resultProfile.answeredCount,
    totalQuestions: resultProfile.totalQuestions,
    dimensionScores: resultProfile.dimensionScores,
    dominantDimensionKeys: resultProfile.dominantDimensionKeys,
    supportingDimensionKeys: resultProfile.supportingDimensionKeys,
    contextMarkers: resultProfile.contextMarkers
  };
}

function buildPreviewPayload(
  resultProfile: AssessmentResultProfile,
  premiumReport: PremiumReport
) {
  return {
    summaryLabel: resultProfile.summaryLabel,
    summaryTitle: resultProfile.summaryTitle,
    summaryNarrative: resultProfile.summaryNarrative,
    summaryDescriptor: resultProfile.summaryDescriptor,
    previewInsights: resultProfile.previewInsights,
    premiumBoundary: resultProfile.premiumBoundary,
    visibleSections: premiumReport.visibleSections,
    lockedSections: premiumReport.lockedSections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      previewTeaser: section.previewTeaser
    }))
  };
}

function serializeSavedSessionOutcome(
  session: {
    id: string;
    anonymousVisitorId: string | null;
    completedAt: Date | null;
  },
  resultProfile: AssessmentResultProfile,
  premiumReport: PremiumReport
): PersistedAssessmentOutcome {
  return {
    source: "saved_session",
    sessionId: session.id,
    anonymousVisitorId: session.anonymousVisitorId,
    completedAt: session.completedAt?.toISOString() ?? null,
    resultProfile,
    premiumReport
  };
}

async function resolveStoredSessionOutcome(
  session: StoredAssessmentSessionShape | null
) {
  if (!session) {
    return null;
  }

  const assessment = await getRuntimeAssessmentDefinitionBySlug(
    session.assessmentSlug
  );

  if (!assessment) {
    return null;
  }

  const storedResultProfile = parseAssessmentResultProfile(session.resultProfile);

  if (storedResultProfile) {
    return serializeSavedSessionOutcome(
      session,
      storedResultProfile,
      assemblePremiumReport(assessment, storedResultProfile)
    );
  }

  const storedAnswers = parseJsonObject<AssessmentResponseMap>(session.answers);

  if (!storedAnswers) {
    return null;
  }

  const resultProfile = scoreAssessment(assessment, storedAnswers);
  const premiumReport = assemblePremiumReport(assessment, resultProfile);

  await updateAssessmentSessionById(session.id, {
    scoringPayload: toJsonValue(buildScoringSnapshot(resultProfile)),
    resultProfile: toJsonValue(resultProfile),
    previewPayload: toJsonValue(buildPreviewPayload(resultProfile, premiumReport))
  });

  return serializeSavedSessionOutcome(session, resultProfile, premiumReport);
}

async function resolveLatestSavedSessionOutcome(input: {
  assessmentSlug: string;
  userId?: string | null;
  anonymousVisitorId?: string | null;
}) {
  const session = input.userId
    ? await getLatestCompletedAssessmentSessionForUser(input.userId, input.assessmentSlug)
    : input.anonymousVisitorId
      ? await getLatestCompletedAssessmentSessionForAnonymousVisitor(
          input.anonymousVisitorId,
          input.assessmentSlug
        )
      : null;

  return resolveStoredSessionOutcome(session ?? null);
}

async function resolveResultProfileForSession(
  assessment: AssessmentDefinition,
  session: StoredAssessmentSessionShape
) {
  const storedResultProfile = parseAssessmentResultProfile(session.resultProfile);

  if (storedResultProfile) {
    return storedResultProfile;
  }

  const storedAnswers = parseJsonObject<AssessmentResponseMap>(session.answers);

  if (!storedAnswers) {
    throw new Error("A completed assessment session is missing the stored answers payload.");
  }

  const resultProfile = scoreAssessment(assessment, storedAnswers);

  await updateAssessmentSessionById(session.id, {
    scoringPayload: toJsonValue(buildScoringSnapshot(resultProfile)),
    resultProfile: toJsonValue(resultProfile)
  });

  return resultProfile;
}

async function loadReportForGeneration(reportId: string) {
  return prisma.report.findUnique({
    where: { id: reportId },
    include: {
      assessmentSession: {
        include: {
          sourceAttribution: true
        }
      },
      sourcePurchase: true,
      sourceAttribution: true
    }
  });
}

function serializeSavedReport(
  report: {
    id: string;
    assessmentSessionId: string | null;
    status: PrismaReportStatus;
    failureReason: string | null;
    generatedAt: Date | null;
    resultProfile: unknown;
    reportPayload: unknown;
  }
): PersistedGeneratedReport {
  return {
    source: "saved_report",
    reportId: report.id,
    sessionId: report.assessmentSessionId,
    generationStatus: mapReportStatus(report.status),
    failureReason: report.failureReason,
    generatedAt: report.generatedAt?.toISOString() ?? null,
    resultProfile: parseAssessmentResultProfile(report.resultProfile),
    premiumReport: parsePremiumReport(report.reportPayload)
  };
}

async function findMembershipAccessGrant(userId: string, assessmentSlug: string) {
  return prisma.membership.findFirst({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "TRIALING"]
      },
      unlockedAssessmentSlugs: {
        array_contains: [assessmentSlug]
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

async function findBundleAccessGrant(userId: string, assessmentSlug: string) {
  return prisma.ownedBundle.findFirst({
    where: {
      userId,
      accessStatus: "ACTIVE",
      includedAssessmentSlugs: {
        array_contains: [assessmentSlug]
      }
    },
    include: {
      sourcePurchase: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

async function createMembershipOrBundleReportIfNeeded(
  userId: string,
  assessment: AssessmentDefinition
) {
  const existing = await getOwnedReportBySlug(userId, assessment.slug);

  if (existing) {
    return existing.id;
  }

  const [membershipGrant, bundleGrant, session] = await Promise.all([
    findMembershipAccessGrant(userId, assessment.slug),
    findBundleAccessGrant(userId, assessment.slug),
    getLatestCompletedAssessmentSessionForUser(userId, assessment.slug)
  ]);

  if (!session) {
    return null;
  }

  if (!membershipGrant && !bundleGrant) {
    return null;
  }

  const report = await prisma.report.create({
    data: {
      userId,
      assessmentSessionId: session.id,
      sourcePurchaseId: bundleGrant?.sourcePurchaseId ?? null,
      sourceAttributionId: session.sourceAttributionId,
      assessmentSlug: assessment.slug,
      topicKey: assessment.topicKey,
      title: assessment.title,
      subtitle: assessment.subtitle,
      tier: "STANDARD",
      status: "QUEUED",
      accessStatus: bundleGrant ? "BUNDLE" : "MEMBERSHIP",
      previewPayload: session.previewPayload ?? undefined,
      resultProfile: session.resultProfile ?? undefined,
      pdfStatus: "PENDING",
      emailStatus: "SKIPPED",
      unlockedAt: new Date()
    }
  });

  return report.id;
}

export async function persistCompletedAssessment(
  input: PersistCompletedAssessmentInput
): Promise<PersistedAssessmentOutcome> {
  const resultProfile = scoreAssessment(input.assessment, input.answers);
  const premiumReport = assemblePremiumReport(input.assessment, resultProfile);
  const session = await saveCompletedAssessmentSession({
    userId: input.userId ?? null,
    anonymousVisitorId: input.anonymousVisitorId ?? null,
    assessmentSlug: input.assessment.slug,
    assessmentTitle: input.assessment.title,
    topicKey: input.assessment.topicKey,
    sourceAttributionId: input.sourceAttributionId ?? null,
    status: "PREVIEW_VIEWED",
    answers: toJsonValue(input.answers),
    scoringPayload: toJsonValue(buildScoringSnapshot(resultProfile)),
    resultProfile: toJsonValue(resultProfile),
    previewPayload: toJsonValue(buildPreviewPayload(resultProfile, premiumReport)),
    startedAt: input.startedAt,
    completedAt: input.completedAt
  });

  await recordOperationalEvent({
    eventType: "assessment_completion",
    eventKey: session.id,
    status: "SUCCEEDED",
    userId: input.userId ?? null,
    reportId: null,
    message: "A completed assessment session was saved.",
    metadata: {
      assessmentSlug: input.assessment.slug,
      anonymousVisitorId: input.anonymousVisitorId ?? null,
      sourceAttributionId: input.sourceAttributionId ?? null
    }
  });

  return serializeSavedSessionOutcome(session, resultProfile, premiumReport);
}

export async function generateAndPersistPremiumReport(
  reportId: string
): Promise<PersistedGeneratedReport | null> {
  const report = await loadReportForGeneration(reportId);

  if (!report) {
    return null;
  }

  const existingResultProfile = parseAssessmentResultProfile(report.resultProfile);
  const existingPremiumReport = parsePremiumReport(report.reportPayload);
  const hasValidSavedReport = Boolean(existingResultProfile && existingPremiumReport);

  if (report.status === "READY" && report.reportPayload && hasValidSavedReport) {
    try {
      await ensureOwnedReportPdfAsset(report.id, report.userId);
      await processQueuedAccountEmailDelivery(report.id);
    } catch {
      // Asset delivery failures should not erase an otherwise saved premium report.
    }

    return serializeSavedReport(report);
  }

  if (report.status === "GENERATING") {
    return serializeSavedReport(report);
  }

  const assessment = await getRuntimeAssessmentDefinitionBySlug(report.assessmentSlug);

  if (!assessment) {
    await updateReportById(report.id, {
      status: "FAILED",
      failureReason: "Assessment definition could not be found for this report."
    });

    await recordOperationalEvent({
      eventType: "report_generation",
      eventKey: report.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      purchaseId: report.sourcePurchaseId,
      message: "Assessment definition could not be found for this report."
    });

    return serializeSavedReport({
      ...report,
      status: "FAILED",
      failureReason: "Assessment definition could not be found for this report."
    });
  }

  const session =
    report.assessmentSession ??
    (await getLatestCompletedAssessmentSessionForUser(report.userId, report.assessmentSlug));

  if (!session) {
    await updateReportById(report.id, {
      status: "FAILED",
      failureReason:
        "No completed assessment session is linked to this report yet, so the premium report cannot be generated."
    });

    await recordOperationalEvent({
      eventType: "report_generation",
      eventKey: report.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      purchaseId: report.sourcePurchaseId,
      message:
        "No completed assessment session is linked to this report yet, so the premium report cannot be generated."
    });

    return serializeSavedReport({
      ...report,
      status: "FAILED",
      failureReason:
        "No completed assessment session is linked to this report yet, so the premium report cannot be generated."
    });
  }

  await updateReportById(report.id, {
    status: "GENERATING",
    assessmentSessionId: session.id,
    sourceAttributionId:
      report.sourceAttributionId ?? session.sourceAttributionId ?? undefined,
    failureReason:
      hasValidSavedReport || report.status !== "READY"
        ? null
        : "The saved report payload was incomplete and is being rebuilt from the stored assessment session."
  });

  await recordOperationalEvent({
    eventType: "report_generation",
    eventKey: report.id,
    status: "STARTED",
    userId: report.userId,
    reportId: report.id,
    purchaseId: report.sourcePurchaseId,
    message: "Premium report generation started from the saved deterministic result profile.",
    metadata: {
      assessmentSlug: report.assessmentSlug,
      tier: report.tier
    }
  });

  try {
    const resultProfile = await resolveResultProfileForSession(
      assessment,
      session
    );
    const provider = getConfiguredAIReportProvider();
    const premiumReport = await assemblePremiumReportWithProvider(
      provider,
      assessment,
      resultProfile
    );

    const updated = await updateReportById(report.id, {
      assessmentSessionId: session.id,
      sourceAttributionId:
        report.sourceAttributionId ?? session.sourceAttributionId ?? undefined,
      status: "READY",
      resultProfile: toJsonValue(resultProfile),
      previewPayload: toJsonValue(buildPreviewPayload(resultProfile, premiumReport)),
      reportPayload: toJsonValue(premiumReport),
      aiPayload: toJsonValue(premiumReport.aiPayload),
      aiSections: toJsonValue(premiumReport.aiNarrativeSections),
      generatedAt: new Date(),
      failureReason: null
    });

    try {
      await ensureOwnedReportPdfAsset(updated.id, updated.userId);
      await processQueuedAccountEmailDelivery(updated.id);
    } catch {
      // Keep the saved report available even if export or delivery needs a retry.
    }

    await recordOperationalEvent({
      eventType: "report_generation",
      eventKey: updated.id,
      status: "SUCCEEDED",
      userId: updated.userId,
      reportId: updated.id,
      purchaseId: updated.sourcePurchaseId,
      message: "Premium report generation completed and the saved report is ready.",
      metadata: {
        generatedAt: updated.generatedAt?.toISOString() ?? null
      }
    });

    return serializeSavedReport(updated);
  } catch (error) {
    const failureReason =
      error instanceof Error
        ? error.message
        : "The premium report narrative layer failed and can be retried.";

    const updated = await updateReportById(report.id, {
      status: "REQUIRES_RETRY",
      failureReason
    });

    await recordOperationalEvent({
      eventType: "report_generation",
      eventKey: report.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      purchaseId: report.sourcePurchaseId,
      message: failureReason
    });

    return serializeSavedReport(updated);
  }
}

export async function getPersistedReportExperience(input: {
  assessmentSlug: string;
  userId?: string | null;
  anonymousVisitorId?: string | null;
}): Promise<PersistedReportExperience | null> {
  if (input.userId) {
    const existingReport = await getOwnedReportBySlug(input.userId, input.assessmentSlug);

    if (existingReport) {
      return generateAndPersistPremiumReport(existingReport.id);
    }

    const assessment = await getRuntimeAssessmentDefinitionBySlug(input.assessmentSlug);

    if (assessment) {
      const accessibleReportId = await createMembershipOrBundleReportIfNeeded(
        input.userId,
        assessment
      );

      if (accessibleReportId) {
        return generateAndPersistPremiumReport(accessibleReportId);
      }
    }
  }

  return resolveLatestSavedSessionOutcome(input);
}

export async function markAssessmentSessionPaid(sessionId: string) {
  return updateAssessmentSessionById(sessionId, {
    status: "PAID",
    paidAt: new Date()
  });
}
