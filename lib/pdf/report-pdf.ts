import type { PremiumReport } from "@/lib/types/assessment-domain";

import type { ReportContent, ReportFile, ReportRecord } from "@/lib/reports/report-ownership";

export interface PdfSectionBlock {
  id: string;
  title: string;
  body: string[];
}

export interface PdfRenderableReport {
  reportId: string;
  title: string;
  subtitle: string;
  generatedAt: string | null;
  preparedFor?: string | null;
  primaryConcern?: string | null;
  profileContext?: string | null;
  bookmarkTitles: string[];
  sections: PdfSectionBlock[];
  footerNote: string;
}

export interface PdfGenerationJob {
  id: string;
  reportId: string;
  userId: string;
  fileName: string;
  targetStorageKey: string;
  status: ReportFile["status"];
  queuedAt: string | null;
  generatedAt: string | null;
  provider: "builtin_pdf_renderer";
  note: string;
}

export function buildPdfRenderableReport(
  reportRecord: ReportRecord,
  reportContent: ReportContent,
  premiumReport: PremiumReport
): PdfRenderableReport {
  return {
    reportId: reportRecord.id,
    title: premiumReport.title,
    subtitle: premiumReport.subtitle,
    generatedAt: reportContent.generatedAt,
    bookmarkTitles: premiumReport.sections.map((section) => section.title),
    sections: premiumReport.sections.map((section) => ({
      id: section.id,
      title: section.title,
      body: [
        section.sectionIntro,
        section.description,
        ...section.blocks
          .map((block) => {
          if (block.type === "paragraph" || block.type === "callout" || block.type === "ai_placeholder") {
            return block.content ?? "";
          }

          if (block.type === "bullet_list") {
            return (block.items ?? []).join(" ");
          }

          if (block.type === "signal_grid") {
            return (block.metrics ?? [])
              .map((metric) => `${metric.label}: ${metric.value}`)
              .join(" | ");
          }

          return "";
        })
          .filter(Boolean)
      ].filter(Boolean)
    })),
    footerNote:
      "Generated from the saved premium report structure so the downloadable document stays aligned with the on-screen reading experience."
  };
}

export function createPdfGenerationJob(
  reportRecord: ReportRecord,
  file: ReportFile
): PdfGenerationJob {
  return {
    id: `${reportRecord.id}-pdf-job`,
    reportId: reportRecord.id,
    userId: reportRecord.userId,
    fileName: file.fileName,
    targetStorageKey:
      file.storageKey ?? `reports/${reportRecord.userId}/${reportRecord.id}/report.pdf`,
    status: file.status,
    queuedAt: reportRecord.generatedAt,
    generatedAt: file.generatedAt,
    provider: "builtin_pdf_renderer",
    note:
      "This job descriptor tracks PDF rendering, storage, retry handling, and download readiness for the owned report asset."
  };
}

export function getPdfStatusNote(file: ReportFile) {
  if (file.status === "ready") {
    return "The saved report has a downloadable PDF asset attached to the owned library.";
  }

  if (file.status === "processing") {
    return "The PDF is still being prepared from the saved premium report and is not ready to download yet.";
  }

  return "The report itself is saved, but the PDF asset needs another generation pass before download or email delivery can continue.";
}
