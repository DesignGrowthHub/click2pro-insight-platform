import "server-only";

import { prisma } from "@/lib/db/prisma";

export type ReportOperationsSnapshot = {
  counts: {
    reportsReady: number;
    pdfReady: number;
    pdfGenerating: number;
    pdfFailed: number;
    emailsSent: number;
    emailsQueued: number;
    emailsFailed: number;
    totalDownloads: number;
    resendAttempts: number;
  };
  recentReports: Array<{
    reportId: string;
    report: string;
    generated: string;
    pdf: string;
    accountEmail: string;
    alternateEmail: string;
    resendAttempts: number;
    downloads: number;
    failureLog: string;
  }>;
};

function formatDateLabel(value: Date | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function mapPdfLabel(status: string) {
  if (status === "READY") {
    return "Ready";
  }

  if (status === "FAILED") {
    return "Failed";
  }

  return "Generating";
}

function mapDeliveryLabel(status?: string | null) {
  if (status === "SENT") {
    return "Sent";
  }

  if (status === "FAILED" || status === "BOUNCED") {
    return "Failed";
  }

  if (status === "QUEUED") {
    return "Queued";
  }

  return "Not sent";
}

export async function getReportOperationsSnapshot(): Promise<ReportOperationsSnapshot> {
  const [
    reportsReady,
    pdfReady,
    pdfGenerating,
    pdfFailed,
    sentDeliveries,
    queuedDeliveries,
    failedDeliveries,
    totalDownloads,
    resendRows,
    recentReports
  ] = await Promise.all([
    prisma.report.count({
      where: {
        status: "READY"
      }
    }),
    prisma.report.count({
      where: {
        pdfStatus: "READY"
      }
    }),
    prisma.report.count({
      where: {
        pdfStatus: {
          in: ["PENDING", "GENERATING"]
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
        status: "SENT"
      }
    }),
    prisma.emailDeliveryRecord.count({
      where: {
        status: "QUEUED"
      }
    }),
    prisma.emailDeliveryRecord.count({
      where: {
        status: {
          in: ["FAILED", "BOUNCED"]
        }
      }
    }),
    prisma.downloadRecord.count(),
    prisma.emailDeliveryRecord.findMany({
      select: {
        resendCount: true
      }
    }),
    prisma.report.findMany({
      include: {
        emailDeliveries: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 8
    })
  ]);

  return {
    counts: {
      reportsReady,
      pdfReady,
      pdfGenerating,
      pdfFailed,
      emailsSent: sentDeliveries,
      emailsQueued: queuedDeliveries,
      emailsFailed: failedDeliveries,
      totalDownloads,
      resendAttempts: resendRows.reduce((sum, row) => sum + row.resendCount, 0)
    },
    recentReports: recentReports.map((report) => {
      const accountDelivery = report.emailDeliveries.find(
        (item) => item.targetType === "ACCOUNT_EMAIL"
      );
      const alternateDelivery = report.emailDeliveries.find(
        (item) => item.targetType === "ALTERNATE_EMAIL"
      );

      return {
        reportId: report.id,
        report: report.title,
        generated: formatDateLabel(report.generatedAt),
        pdf: mapPdfLabel(report.pdfStatus),
        accountEmail: mapDeliveryLabel(accountDelivery?.status ?? report.emailStatus),
        alternateEmail: mapDeliveryLabel(alternateDelivery?.status),
        resendAttempts:
          (accountDelivery?.resendCount ?? 0) + (alternateDelivery?.resendCount ?? 0),
        downloads: report.downloadCount,
        failureLog:
          report.pdfFailureReason ??
          alternateDelivery?.failureReason ??
          accountDelivery?.failureReason ??
          report.failureReason ??
          "None"
      };
    })
  };
}
