import "server-only";

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { getReportAssetStorageOverride } from "@/lib/config/env";

const DEFAULT_REPORT_ASSET_STORAGE_DIR = path.join(process.cwd(), ".insight-assets");

function getStorageRoot() {
  return getReportAssetStorageOverride() || DEFAULT_REPORT_ASSET_STORAGE_DIR;
}

function normalizeStorageKey(storageKey: string) {
  return storageKey.replace(/^\/+/, "");
}

async function ensureParentDirectory(absolutePath: string) {
  await mkdir(path.dirname(absolutePath), { recursive: true });
}

export function buildReportPdfStorageKey(input: {
  userId: string;
  reportId: string;
  fileName?: string;
}) {
  const fileName = input.fileName ?? "insight-report.pdf";

  return path.posix.join("reports", input.userId, input.reportId, fileName);
}

export function buildEmailPreviewStorageKey(input: {
  reportId: string;
  deliveryRecordId: string;
  targetType: "account_email" | "alternate_email";
}) {
  return path.posix.join(
    "email-previews",
    input.reportId,
    `${input.targetType}-${input.deliveryRecordId}.json`
  );
}

export function resolveAbsoluteAssetPath(storageKey: string) {
  return path.join(getStorageRoot(), normalizeStorageKey(storageKey));
}

export async function writeStoredAsset(
  storageKey: string,
  contents: Buffer | string
) {
  const absolutePath = resolveAbsoluteAssetPath(storageKey);

  await ensureParentDirectory(absolutePath);
  await writeFile(absolutePath, contents);

  return {
    storageKey,
    absolutePath
  };
}

export async function readStoredAsset(storageKey: string) {
  return readFile(resolveAbsoluteAssetPath(storageKey));
}

export async function storedAssetExists(storageKey: string) {
  try {
    await stat(resolveAbsoluteAssetPath(storageKey));
    return true;
  } catch {
    return false;
  }
}

export async function persistReportPdfAsset(input: {
  userId: string;
  reportId: string;
  fileName: string;
  buffer: Buffer;
}) {
  const storageKey = buildReportPdfStorageKey({
    userId: input.userId,
    reportId: input.reportId,
    fileName: input.fileName
  });

  const asset = await writeStoredAsset(storageKey, input.buffer);

  return {
    ...asset,
    fileName: input.fileName
  };
}

export async function persistEmailPreviewAsset(input: {
  reportId: string;
  deliveryRecordId: string;
  targetType: "account_email" | "alternate_email";
  payload: Record<string, unknown>;
}) {
  const storageKey = buildEmailPreviewStorageKey({
    reportId: input.reportId,
    deliveryRecordId: input.deliveryRecordId,
    targetType: input.targetType
  });

  const asset = await writeStoredAsset(
    storageKey,
    JSON.stringify(input.payload, null, 2)
  );

  return {
    ...asset,
    fileName: path.basename(storageKey)
  };
}

export function getReportPdfDownloadUrl(reportId: string) {
  return `/api/report-assets/${reportId}/pdf`;
}
