# AI Insight Engine

## Purpose

The AI Insight Engine adds premium narrative interpretation on top of deterministic scoring. Scoring remains the source of truth. AI is used only to turn scored patterns into calmer, richer report language.

## Current module layout

- `lib/ai/payloads/build-ai-insight-payload.ts`
  - Builds the structured payload from deterministic result data.
  - Adds tone requirements, safety instructions, section-generation plans, and subscription follow-up blueprints.
- `lib/ai/prompts/assessment-contexts.ts`
  - Holds per-assessment interpretive context for all 10 launch assessments.
- `lib/ai/prompts/report-section-prompts.ts`
  - Builds section-specific prompt bundles.
  - Keeps prompts bounded to the scored profile.
- `lib/ai/reporting/provider.ts`
  - Provider contract for section-by-section generation.
- `lib/ai/reporting/openai-provider.ts`
  - Placeholder boundary where real server-side OpenAI integration will go later.
- `lib/ai/reporting/validation.ts`
  - Validates and sanitizes generated text before assembly.
- `lib/ai/reporting/section-generator.ts`
  - Generates report sections one at a time for easier QA and retry behavior.
- `lib/ai/reporting/insight-engine.ts`
  - Orchestrates payload creation and section generation.
- `lib/report-assembly/premium-report-assembly.ts`
  - Combines deterministic result data, preview insights, AI narrative sections, and recommendations into the final premium report object.

## Intended live flow

1. Deterministic scoring completes in `lib/scoring/assessment-scoring.ts`.
2. `buildAIInsightPayload` turns that result into an AI-safe structured payload.
3. `buildReportSectionPromptBundle` creates one prompt bundle per premium report section.
4. A future server-only provider will call OpenAI once per section.
5. `sanitizeNarrativeSection` validates and bounds the returned text.
6. `assemblePremiumReport` merges validated AI sections into the final report object for UI, PDF, and dashboard storage.

## Real OpenAI integration later

- The actual API call should happen inside `provider.generateSection`.
- Credentials and model selection must come from environment variables.
- The call should run from a server-only route or action, not the client.
- Raw responses should be validated before persistence or rendering.

## Why the engine is sectional

- Easier prompt QA by report section
- Easier retries if one section fails
- Better consistency across premium reports
- Cleaner support for future subscriber-only follow-up narratives

## Subscription-ready direction

The follow-up blueprint already reserves space for:

- report comparison narratives
- follow-up reflection prompts
- what-changed-since-last-report summaries
- monthly reflection summaries
- connected-pattern suggestions across owned reports

