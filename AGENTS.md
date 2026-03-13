# Click2Pro Insight Platform Instructions

## Project Identity
- Product: Click2Pro Insight Platform
- Primary domain: `insight.click2pro.com`
- Parent content site: `click2pro.com`
- Core business goal: monetize existing psychology blog traffic with topic-specific assessments, paid reports, bundles, and subscriptions
- Product framing: this is an insight platform, not a diagnosis platform

## Audience
- Primary audience: USA-based readers arriving from psychology and self-insight blog content
- User mindset: emotionally activated, curious, self-reflective, and looking for clarity fast
- Tone target: premium, serious, psychologically intelligent, calm, and conversion-focused

## Product Rules
- Keep the experience oriented around insight, pattern recognition, and guided reflection.
- Avoid diagnostic claims, medical promises, or language that implies treatment.
- Do not assume we can manually update 1000+ existing blog posts.
- Route users from blogs into assessments through reusable popup logic tied to blog URL/topic mapping.
- Every major flow should make the free vs paid boundary explicit.

## Working Style
- Use documentation-first planning before building product code.
- Keep planning files practical, brief, and implementation-friendly.
- Do not install dependencies unless the current task requires it.
- The base Next.js app shell already exists; expand it through reusable components and data-driven structures instead of one-off page code.
- Do not generate fake production features, fake analytics, or fake backend integrations.

## Content and UX Guardrails
- Write in plain English with emotional precision.
- Favor clarity over hype.
- Present outcomes as insights, tendencies, or patterns.
- Make report value concrete: what the user learns, what feels personalized, and what action they can take next.
- Keep disclaimers subtle but clear where needed.

## Launch Scope
- Initial launch includes 10 assessments:
  - Condescending Behavior Decoder
  - Imposter Syndrome Deep Report
  - Relationship Infatuation / Obsession Analysis
  - Toxic Pattern & Red Flag Report
  - Emotional Detachment / Nihilism Insight
  - Anhedonia & Motivation Pattern Scan
  - Personality Burnout & Stress Report
  - Attachment & Relationship Style Report
  - Identity & Inner Conflict Profile
  - Closure & Emotional Recovery Report

## Planning Structure
- `planning/strategy`: product direction, launch constraints, implementation phases
- `planning/content`: homepage copy and blog-to-assessment routing content
- `planning/assessments`: one markdown file per launch assessment
- `planning/reports`: paid report structure and logic
- `planning/pricing`: offers, bundles, and subscription planning
- `planning/popup-logic`: blog popup behavior and routing rules
- `planning/admin-notes`: admin/dashboard operations planning
- `planning/tech-architecture`: system design and implementation notes

## App Structure
- `app`: Next.js App Router pages and route shells
- `app/embed`: embeddable script routes for cross-site conversion flows
- `components/ui`: reusable design system primitives
- `components/assessments`, `components/pricing`, `components/reports`: product-facing reusable blocks
- `lib/assessments.ts`: seeded mock metadata for launch topics
- `lib/blog-popup`: blog-topic mapping, detection, routing, and embed-script logic
- `lib/ai-reporting`: provider boundary, follow-up architecture, and narrative generation orchestration
- `lib/openai-payloads`: structured payload builders for later OpenAI requests
- `lib/openai-prompts`: reusable prompt templates and tone guardrails
- `lib/report-assembly`: deterministic plus AI narrative report assembly
- `lib/site-content.ts`: shared placeholder content and pricing structures

## If You Build Later
- Preserve the split between the blog/content site and the insight product.
- Treat blog topic detection and assessment routing as a first-class system, not a manual content task.
- Keep assessment definitions reusable so new assessments can be added without rewriting the platform.
- Design for report templating, payment gating, and analytics from the start.
