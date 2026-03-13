import type {
  ReportContent,
  ReportFile,
  ReportRecord
} from "@/lib/reports/report-ownership";

export interface ReportStorageDescriptor {
  reportId: string;
  userId: string;
  contentStorageKey: string;
  pdfStorageKey: string;
  dashboardVisible: boolean;
  storageMode: "local_asset_store" | "server_persisted";
  note: string;
}

export function buildReportStorageDescriptor(
  reportRecord: ReportRecord,
  reportContent: ReportContent,
  file: ReportFile
): ReportStorageDescriptor {
  return {
    reportId: reportRecord.id,
    userId: reportRecord.userId,
    contentStorageKey: `reports/${reportRecord.userId}/${reportRecord.id}/content.json`,
    pdfStorageKey:
      file.storageKey ?? `reports/${reportRecord.userId}/${reportRecord.id}/report.pdf`,
    dashboardVisible: true,
    storageMode: "local_asset_store",
    note:
      `This report is stored as a durable owned asset with a content record and a PDF storage key. Content state: ${reportContent.contentStatus}.`
  };
}
