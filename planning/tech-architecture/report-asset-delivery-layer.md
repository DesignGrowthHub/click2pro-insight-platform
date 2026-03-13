# Report Asset Delivery Layer

## What this layer does

This layer turns a saved premium report into a durable owned asset:

1. The saved `Report` record remains the canonical report entry.
2. When a full report is ready, the server can generate a PDF asset from the persisted premium report payload.
3. The PDF asset is stored with a storage key and linked back to the report.
4. Email delivery attempts are persisted per send attempt in `EmailDeliveryRecord`.
5. Download events are persisted in `DownloadRecord`.

## PDF generation flow

1. A report reaches `READY` after deterministic scoring plus premium narrative assembly.
2. `generateAndPersistPremiumReport()` calls `ensureOwnedReportPdfAsset()` after the report payload is saved.
3. The PDF renderer uses the saved premium report structure, not browser state.
4. Asset metadata is written back to `Report`:
   - `pdfStatus`
   - `pdfStorageKey`
   - `pdfFileUrl`
   - `pdfGeneratedAt`
   - `pdfFailureReason`
5. Downloads use `/api/report-assets/[reportId]/pdf`, which verifies ownership and records a `DownloadRecord`.

## Email provider abstraction

- `lib/email/provider.ts` selects the configured provider.
- Live provider: Resend via HTTPS API.
- Development fallback: mock provider that writes email previews to the asset store instead of sending externally.

Required env for live email:

- `RESEND_API_KEY`
- `EMAIL_FROM_ADDRESS`

## Report asset lifecycle

Primary statuses:

- PDF:
  - `PENDING`
  - `GENERATING`
  - `READY`
  - `FAILED`
- Email:
  - `QUEUED`
  - `SENT`
  - `FAILED`
  - `BOUNCED`
  - `SKIPPED`

The report itself is still the owned object. The PDF and email records are operational layers attached to that report.

## Resend and alternate-email flow

- Initial purchase queues an account-email delivery record.
- Once the report is generated and the PDF is ready, the queued account-email delivery can be processed automatically.
- Manual resend creates a new delivery attempt record.
- Alternate-email send creates a new `ALTERNATE_EMAIL` delivery record.
- Previous attempts are preserved for auditability.

## Download tracking

Each successful PDF download records:

- `reportId`
- `userId`
- `fileType`
- `fileVersion`
- `sourceContext`
- `downloadedAt`

The parent `Report` also keeps aggregate `downloadCount` and `lastDownloadedAt` for fast library reads.

## Deployment notes

- Local/dev storage defaults to `.insight-assets` in the project root.
- Production should point `REPORT_ASSET_STORAGE_DIR` at persistent storage, or this layer can later be swapped to object storage without changing the UI contract.
- `APP_BASE_URL` is used for email links back to the owned report page.
