# Report Ownership, PDF, and Delivery Foundation

## Purpose

Paid reports should behave like owned assets, not temporary unlock states. The current front-end foundation is structured so real storage, PDF generation, and email delivery can be attached without redesigning the user-facing library.

## Current module layout

- `lib/reports/report-ownership.ts`
  - Shared ownership-facing models for `ReportRecord`, `ReportContent`, `ReportFile`, `ReportAccess`, `EmailDeliveryRecord`, and `DownloadRecord`.
- `lib/pdf/report-pdf.ts`
  - Placeholder transformation layer from the premium report object into a PDF-ready document shape.
- `lib/email/report-delivery.ts`
  - Delivery request planning for automatic send, resend, and alternate-email actions.
- `lib/storage/report-storage.ts`
  - Storage descriptors for future content and PDF persistence.
- `lib/commerce/ownership-store.ts`
  - Local placeholder ownership persistence and post-purchase state transitions.

## Intended live flow

1. Purchase completes and ownership is granted.
2. A server-side report record is persisted for the user.
3. Full report content is stored against that record.
4. A PDF generation job runs from the stored premium report object.
5. PDF storage key is attached to the report file record.
6. Automatic account-email delivery runs once the PDF is ready.
7. Dashboard and report pages read the same ownership state for view, download, and resend actions.

## Later integration points

- PDF renderer:
  - Attach to `lib/pdf/report-pdf.ts` job descriptors.
- Email provider:
  - Attach to `lib/email/report-delivery.ts` request descriptors.
- Storage:
  - Replace placeholder-local storage with a server-side persistence layer using the storage keys already modeled.
- Webhooks:
  - Final purchase confirmation should grant ownership before delivery jobs begin.

## UX rules already reflected in the app

- Reports stay visible in the dashboard as owned assets.
- PDF and email controls remain visible even when a file is still processing.
- Failed generation or delivery states stay readable instead of disappearing.
- Membership can later widen access without changing the library model.

