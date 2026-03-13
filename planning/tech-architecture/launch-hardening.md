# Launch Hardening Notes

## What This Layer Adds

- Anonymous visitor assessment progress can now be merged into an authenticated account.
- Failed report generation, PDF export, and email delivery now have explicit retry paths.
- Admin has a recovery surface for failures, explanation-session follow-up, and environment gaps.
- Critical operations now write internal operational events for debugging and recovery visibility.
- Runtime configuration now has one central diagnostics layer instead of scattered `process.env` reads.

## Anonymous To User Merge Flow

1. Anonymous visitors receive the `click2pro_insight_visitor` cookie when they complete an assessment.
2. After login or signup, the client calls `/api/auth/merge-anonymous`.
3. The server reassigns matching `AssessmentSession` rows from `anonymousVisitorId` to `userId`.
4. Related `SourceAttribution` rows are also attached to the authenticated user when safe.
5. The anonymous cookie is cleared after a successful merge.
6. `/api/commerce/library`, `/api/reports/[slug]`, and assessment completion also perform opportunistic merge checks so continuity still works if the explicit merge request is missed.

## Fulfillment Recovery Lifecycle

### Report generation

- Primary service: `generateAndPersistPremiumReport()`
- Recovery service: `retryReportGeneration()`
- Statuses:
  - `QUEUED`
  - `GENERATING`
  - `READY`
  - `FAILED`
  - `REQUIRES_RETRY`

Failures do not delete ownership. A paid report can remain owned while the premium narrative layer is retried.

### PDF generation

- Primary service: `ensureOwnedReportPdfAsset()`
- Recovery service: `retryReportPdfGeneration()`
- Statuses:
  - `PENDING`
  - `GENERATING`
  - `READY`
  - `FAILED`

If a ready PDF asset already exists, it is reused. Regeneration only happens when explicitly forced.

### Email delivery

- Primary service: `queueAndSendOwnedReportEmail()`
- Recovery service: `retryReportAccountEmailDelivery()`
- Delivery statuses:
  - `QUEUED`
  - `SENT`
  - `FAILED`
  - `BOUNCED`
  - `SKIPPED`

Queued account-email attempts are reused when possible to reduce duplicate sends. Resends are recorded as separate attempts rather than mutating prior history.

## Internal Observability

Critical operations now record `OperationalEvent` rows:

- `assessment_completion`
- `anonymous_merge`
- `payment_confirmation`
- `ownership_grant`
- `report_generation`
- `report_pdf_generation`
- `report_pdf_download`
- `report_email_delivery`
- `explanation_entitlement`

These events are intended for founder/admin debugging first. They can later be forwarded to external monitoring if needed.

## Admin Recovery Surface

`/api/admin/operational-recovery` powers the recovery UI and currently exposes:

- failed premium report generations
- failed PDF exports
- failed email deliveries
- explanation entitlements that are pending operational follow-up
- recent operational failures
- environment diagnostics

Current actions:

- retry report generation
- retry PDF generation
- retry account-email delivery
- update explanation entitlement status

## Explanation Session Operational Readiness

Explanation entitlements are still lightweight, but now support operational statuses:

- `PENDING`
- `READY_FOR_CONTACT`
- `CONTACTED`
- `SCHEDULED`
- `COMPLETED`
- `CANCELED`
- `EXPIRED`

This is intentionally not a scheduling product yet. Initial launch operations can stay manual:

1. purchase creates entitlement
2. entitlement appears in dashboard and admin
3. admin marks it ready for contact / contacted / completed
4. future scheduling can attach later without changing the entitlement contract

## Go-Live Checklist

### Required core configuration

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `APP_BASE_URL`

### Payments

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

### AI reporting

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Delivery

- `RESEND_API_KEY`
- `EMAIL_FROM_ADDRESS`
- optional `REPORT_ASSET_STORAGE_DIR`

## Pre-Launch Manual Checks

1. Complete one anonymous assessment, then log in, and confirm the saved session still appears through the authenticated account.
2. Complete one Stripe purchase and one Razorpay purchase in test mode, then confirm:
   - checkout intent is marked paid
   - purchase is persisted
   - ownership is granted
   - saved report is generated
3. Confirm a PDF can be downloaded from an owned report.
4. Confirm account-email delivery and alternate-email delivery both record status correctly.
5. Open the admin recovery panel and confirm failed states can be retried.
6. For India explanation offers, confirm the entitlement appears in both dashboard and admin with `READY_FOR_CONTACT`.

## Still Deferred

- external monitoring / alerting provider
- background jobs / queue workers for report generation and delivery
- automated bounce/retry reconciliation from the email provider
- psychologist-session booking/calendar tooling
- automatic anonymous-to-user merge of historical local-demo state
