import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateReportPdfBuffer } from "@/lib/pdf/generate-report-pdf";
import type {
  PdfRenderableReport,
  PdfSectionBlock
} from "@/lib/pdf/report-pdf";
import { formatProfileContextLine } from "@/lib/profile/completion";
import {
  getReportPdfDownloadUrl,
  persistReportPdfAsset,
  readStoredAsset,
  storedAssetExists
} from "@/lib/storage/report-assets";
import { recordOperationalEvent } from "@/lib/server/services/operational-events";
import { getUserDisplayName } from "@/lib/server/services/users";
import type {
  PremiumReport,
  ReportContentBlock
} from "@/lib/types/assessment-domain";

type ReportForAssets = NonNullable<
  Awaited<ReturnType<typeof loadReportForAssets>>
>;

function parsePremiumReport(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as PremiumReport;
}

function formatGeneratedLabel(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function blockToParagraph(block: ReportContentBlock) {
  if (block.type === "paragraph" || block.type === "callout" || block.type === "ai_placeholder") {
    return block.content ?? "";
  }

  if (block.type === "bullet_list") {
    return (block.items ?? []).map((item) => `- ${item}`).join("\n");
  }

  if (block.type === "signal_grid") {
    return (block.metrics ?? [])
      .map((metric) => `${metric.label}: ${metric.value}`)
      .join(" | ");
  }

  return "";
}

function buildRenderableSections(report: PremiumReport): PdfSectionBlock[] {
  return report.sections.map((section) => ({
    id: section.id,
    title: section.title,
    body: [
      section.sectionIntro,
      section.description,
      ...section.blocks.map(blockToParagraph)
    ].filter(Boolean)
  }));
}

function buildRenderableReport(
  reportRecord: ReportForAssets,
  premiumReport: PremiumReport
): PdfRenderableReport {
  return {
    reportId: reportRecord.id,
    title: premiumReport.title,
    subtitle: premiumReport.subtitle,
    generatedAt: formatGeneratedLabel(reportRecord.generatedAt),
    preparedFor: reportRecord.user ? getUserDisplayName(reportRecord.user) : null,
    primaryConcern: reportRecord.user?.primaryConcern ?? null,
    profileContext: reportRecord.user
      ? formatProfileContextLine(reportRecord.user)
      : null,
    bookmarkTitles:
      premiumReport.pdfOutline.bookmarkTitles.length > 0
        ? premiumReport.pdfOutline.bookmarkTitles
        : premiumReport.sections.map((section) => section.title),
    sections: buildRenderableSections(premiumReport),
    footerNote:
      "This saved report is structured for reflection and pattern recognition. It does not act as a diagnosis or treatment plan."
  };
}

function buildPdfFileName(report: ReportForAssets) {
  return `${report.assessmentSlug}-insight-report.pdf`;
}

async function loadReportForAssets(reportId: string, userId?: string | null) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      ...(userId ? { userId } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          preferredName: true,
          primaryConcern: true,
          country: true,
          ageRange: true,
          occupationOrLifeStage: true
        }
      }
    }
  });
}

export async function ensureOwnedReportPdfAsset(
  reportId: string,
  userId?: string | null,
  options?: {
    forceRegenerate?: boolean;
  }
) {
  const report = await loadReportForAssets(reportId, userId);

  if (!report) {
    throw new Error("The owned report could not be found.");
  }

  if (report.accessStatus === "PREVIEW_ONLY") {
    throw new Error("The full report is not unlocked for this account.");
  }

  if (report.status !== "READY") {
    throw new Error("The premium report is not ready to be exported yet.");
  }

  const premiumReport = parsePremiumReport(report.reportPayload);

  if (!premiumReport) {
    throw new Error("The saved report payload is missing and cannot be exported yet.");
  }

  if (
    !options?.forceRegenerate &&
    report.pdfStatus === "GENERATING"
  ) {
    throw new Error("The report PDF is already being prepared. Please try again shortly.");
  }

  if (
    !options?.forceRegenerate &&
    report.pdfStatus === "READY" &&
    report.pdfStorageKey &&
    (await storedAssetExists(report.pdfStorageKey))
  ) {
    if (!report.pdfFileUrl) {
      await prisma.report.update({
        where: {
          id: report.id
        },
        data: {
          pdfFileUrl: getReportPdfDownloadUrl(report.id)
        }
      });
    }

    return {
      report,
      fileName: buildPdfFileName(report),
      storageKey: report.pdfStorageKey,
      fileUrl: report.pdfFileUrl ?? getReportPdfDownloadUrl(report.id),
      buffer: await readStoredAsset(report.pdfStorageKey)
    };
  }

  await prisma.report.update({
    where: {
      id: report.id
    },
    data: {
      pdfStatus: "GENERATING",
      pdfFailureReason: null
    }
  });

  await recordOperationalEvent({
    eventType: "report_pdf_generation",
    eventKey: report.id,
    status: options?.forceRegenerate ? "RETRIED" : "STARTED",
    userId: report.userId,
    reportId: report.id,
    message: options?.forceRegenerate
      ? "PDF generation was retried for the owned report."
      : "PDF generation started for the owned report."
  });

  try {
    const renderable = buildRenderableReport(report, premiumReport);
    const buffer = generateReportPdfBuffer(renderable);
    const fileName = buildPdfFileName(report);
    const stored = await persistReportPdfAsset({
      userId: report.userId,
      reportId: report.id,
      fileName,
      buffer
    });
    const fileUrl = getReportPdfDownloadUrl(report.id);

    await prisma.report.update({
      where: {
        id: report.id
      },
      data: {
        pdfStatus: "READY",
        pdfStorageKey: stored.storageKey,
        pdfFileUrl: fileUrl,
        pdfGeneratedAt: new Date(),
        pdfFailureReason: null
      }
    });

    await recordOperationalEvent({
      eventType: "report_pdf_generation",
      eventKey: report.id,
      status: "SUCCEEDED",
      userId: report.userId,
      reportId: report.id,
      message: "PDF generation completed for the owned report.",
      metadata: {
        storageKey: stored.storageKey,
        forceRegenerate: Boolean(options?.forceRegenerate)
      }
    });

    return {
      report,
      fileName,
      storageKey: stored.storageKey,
      fileUrl,
      buffer
    };
  } catch (error) {
    const failureReason =
      error instanceof Error
        ? error.message
        : "The report PDF could not be generated.";

    await prisma.report.update({
      where: {
        id: report.id
      },
      data: {
        pdfStatus: "FAILED",
        pdfFailureReason: failureReason
      }
    });

    await recordOperationalEvent({
      eventType: "report_pdf_generation",
      eventKey: report.id,
      status: "FAILED",
      level: "ERROR",
      userId: report.userId,
      reportId: report.id,
      message: failureReason,
      metadata: {
        forceRegenerate: Boolean(options?.forceRegenerate)
      }
    });

    throw error;
  }
}

export async function recordOwnedReportDownload(input: {
  reportId: string;
  userId: string;
  sourceContext: string;
  fileVersion?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const downloadedAt = new Date();
  const metadata = input.metadata
    ? (JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue)
    : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.downloadRecord.create({
      data: {
        userId: input.userId,
        reportId: input.reportId,
        fileType: "pdf",
        fileVersion: input.fileVersion ?? "premium-report-v1",
        sourceContext: input.sourceContext,
        metadata,
        downloadedAt
      }
    });

    await tx.report.update({
      where: {
        id: input.reportId
      },
      data: {
        lastDownloadedAt: downloadedAt,
        downloadCount: {
          increment: 1
        }
      }
    });
  });

  await recordOperationalEvent({
    eventType: "report_pdf_download",
    eventKey: `${input.reportId}:${downloadedAt.toISOString()}`,
    status: "SUCCEEDED",
    userId: input.userId,
    reportId: input.reportId,
    message: "A saved report PDF was downloaded.",
    metadata: {
      sourceContext: input.sourceContext,
      fileVersion: input.fileVersion ?? "premium-report-v1"
    }
  });

  return downloadedAt;
}
