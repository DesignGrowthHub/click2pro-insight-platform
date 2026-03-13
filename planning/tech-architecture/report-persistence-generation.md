# Report Persistence And Generation

## Assessment completion flow
- `POST /api/assessments/[slug]/complete` is now the canonical completion entry point.
- The route resolves the authenticated user when available.
- If the user is anonymous, the route creates or reuses the `click2pro_insight_visitor` cookie so repeated completions can still be tied to a temporary visitor identity.
- The server runs deterministic scoring, builds the canonical `AssessmentResultProfile`, composes the preview-facing report structure, and saves the `AssessmentSession` with:
  - answers
  - scoring payload
  - result profile
  - preview payload
  - user or anonymous visitor linkage

## Report generation lifecycle
- Ownership grant still begins in the commerce layer.
- After confirmed payment, the commerce grant flow now creates a queued `Report` record instead of pretending the report is already ready.
- `generateAndPersistPremiumReport(reportId)` is the canonical generation service.
- Generation steps:
  1. Load the linked report and assessment session
  2. Reuse saved deterministic scoring, or recompute it from saved answers if needed
  3. Select the AI provider through `lib/ai/reporting/provider-factory.ts`
  4. Build AI section prompts from the deterministic result profile
  5. Generate section-by-section narrative
  6. Assemble the final premium report object
  7. Persist preview payload, result profile, AI payload, AI sections, and final report payload

## Status model
- `AssessmentSession.status` continues to reflect the assessment lifecycle.
- `Report.status` now supports:
  - `QUEUED`
  - `GENERATING`
  - `READY`
  - `FAILED`
  - `REQUIRES_RETRY`
  - `ARCHIVED`
- Ownership is not revoked when generation fails. Instead, the report can remain owned while the narrative layer retries later.

## OpenAI integration point
- The real provider boundary is `lib/ai/reporting/openai-provider.ts`.
- `OPENAI_API_KEY` enables the live provider.
- `OPENAI_MODEL` selects the model.
- When OpenAI config is absent, the provider factory falls back to the existing mock narrative provider so local development still runs safely.
- Generated output is expected as strict JSON and is validated before it is saved.

## Retrieval flow
- `GET /api/reports/[slug]` is the canonical read path for report experience hydration.
- Retrieval order:
  1. Existing owned report for the authenticated user
  2. Membership or bundle-backed report materialization if access exists but a report record has not been created yet
  3. Latest saved completed assessment session for the authenticated user
  4. Latest saved anonymous visitor session for the current visitor cookie
- The report page and dashboard library now prefer persistent DB-backed state and only fall back to browser/demo state when no saved record exists yet.

## What Stripe and Razorpay already trigger
- Successful checkout confirmation still grants ownership through the existing commerce layer.
- The commerce grant now also queues and generates the report instead of only creating a thin owned placeholder.
- Future webhook improvements can move generation to background jobs without changing the report payload shape or the report retrieval APIs.
