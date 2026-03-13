import "server-only";

import { getEnvironmentDiagnosticsSummary } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { listRecentOperationalEvents } from "@/lib/server/services/operational-events";

export type OperationalRecoverySnapshot = {
  counts: {
    failedReports: number;
    failedPdfs: number;
    failedEmails: number;
    pendingExplanations: number;
    recentFailures: number;
    missingRequiredEnv: number;
  };
  env: {
    missingRequired: number;
    missingOptional: number;
    diagnostics: Array<{
      key: string;
      label: string;
      feature: string;
      configured: boolean;
      status: "configured" | "missing_required" | "missing_optional";
      note: string;
    }>;
  };
  failedReports: Array<{
    reportId: string;
    title: string;
    assessmentSlug: string;
    userEmail: string;
    status: string;
    failureReason: string;
    updatedAt: string;
  }>;
  failedPdfs: Array<{
    reportId: string;
    title: string;
    userEmail: string;
    pdfStatus: string;
    failureReason: string;
    updatedAt: string;
  }>;
  failedEmails: Array<{
    deliveryId: string;
    reportId: string;
    reportTitle: string;
    recipientEmail: string;
    status: string;
    failureReason: string;
    resendCount: number;
    lastAttemptedAt: string | null;
  }>;
  explanationEntitlements: Array<{
    entitlementId: string;
    title: string;
    assessmentSlug: string | null;
    reportTitle: string | null;
    userEmail: string;
    durationMinutes: number;
    status: string;
    grantedAt: string | null;
    scheduledFor: string | null;
  }>;
  recentFailures: Array<{
    id: string;
    eventType: string;
    message: string;
    level: string;
    createdAt: string;
    reportId: string | null;
    checkoutIntentId: string | null;
  }>;
};

export async function getOperationalRecoverySnapshot(): Promise<OperationalRecoverySnapshot> {
  const [
    failedReportsCount,
    failedPdfsCount,
    failedEmailsCount,
    pendingExplanationsCount,
    failedReports,
    failedPdfs,
    failedEmails,
    explanationEntitlements,
    recentFailures
  ] = await Promise.all([
    prisma.report.count({
      where: {
        status: {
          in: ["FAILED", "REQUIRES_RETRY"]
        }
      }
    }),
    prisma.report.count({
      where: {
        pdfStatus: "FAILED"
      }
    }),
    prisma.emailDeliveryRecord.count({
      where: {
        status: {
          in: ["FAILED", "BOUNCED"]
        }
      }
    }),
    prisma.explanationEntitlement.count({
      where: {
        status: {
          in: ["PENDING", "READY_FOR_CONTACT", "CONTACTED", "SCHEDULED"]
        }
      }
    }),
    prisma.report.findMany({
      where: {
        status: {
          in: ["FAILED", "REQUIRES_RETRY"]
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 10
    }),
    prisma.report.findMany({
      where: {
        pdfStatus: "FAILED"
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 10
    }),
    prisma.emailDeliveryRecord.findMany({
      where: {
        status: {
          in: ["FAILED", "BOUNCED"]
        }
      },
      include: {
        report: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 10
    }),
    prisma.explanationEntitlement.findMany({
      where: {
        status: {
          in: ["PENDING", "READY_FOR_CONTACT", "CONTACTED", "SCHEDULED"]
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        },
        report: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 10
    }),
    listRecentOperationalEvents({
      statuses: ["FAILED"],
      limit: 10
    })
  ]);

  const envSummary = getEnvironmentDiagnosticsSummary();

  return {
    counts: {
      failedReports: failedReportsCount,
      failedPdfs: failedPdfsCount,
      failedEmails: failedEmailsCount,
      pendingExplanations: pendingExplanationsCount,
      recentFailures: recentFailures.length,
      missingRequiredEnv: envSummary.missingRequired
    },
    env: {
      missingRequired: envSummary.missingRequired,
      missingOptional: envSummary.missingOptional,
      diagnostics: envSummary.diagnostics.map((item) => ({
        key: item.key,
        label: item.label,
        feature: item.feature,
        configured: item.configured,
        status: item.status,
        note: item.note
      }))
    },
    failedReports: failedReports.map((report) => ({
      reportId: report.id,
      title: report.title,
      assessmentSlug: report.assessmentSlug,
      userEmail: report.user.email,
      status: report.status,
      failureReason: report.failureReason ?? "The report needs another generation pass.",
      updatedAt: report.updatedAt.toISOString()
    })),
    failedPdfs: failedPdfs.map((report) => ({
      reportId: report.id,
      title: report.title,
      userEmail: report.user.email,
      pdfStatus: report.pdfStatus,
      failureReason: report.pdfFailureReason ?? "The PDF asset needs another generation pass.",
      updatedAt: report.updatedAt.toISOString()
    })),
    failedEmails: failedEmails.map((delivery) => ({
      deliveryId: delivery.id,
      reportId: delivery.reportId,
      reportTitle: delivery.report.title,
      recipientEmail: delivery.recipientEmail,
      status: delivery.status,
      failureReason: delivery.failureReason ?? "Delivery failed without a stored reason.",
      resendCount: delivery.resendCount,
      lastAttemptedAt: delivery.lastAttemptedAt?.toISOString() ?? null
    })),
    explanationEntitlements: explanationEntitlements.map((entitlement) => ({
      entitlementId: entitlement.id,
      title: entitlement.title,
      assessmentSlug: entitlement.assessmentSlug,
      reportTitle: entitlement.report?.title ?? null,
      userEmail: entitlement.user.email,
      durationMinutes: entitlement.durationMinutes,
      status: entitlement.status,
      grantedAt: entitlement.grantedAt?.toISOString() ?? null,
      scheduledFor: entitlement.scheduledFor?.toISOString() ?? null
    })),
    recentFailures: recentFailures.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      message: event.message,
      level: event.level,
      createdAt: event.createdAt.toISOString(),
      reportId: event.reportId ?? null,
      checkoutIntentId: event.checkoutIntentId ?? null
    }))
  };
}
