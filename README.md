# Click2Pro Insight Platform

Click2Pro Insight Platform is the monetization layer being built for `click2pro.com`. The main site will continue to publish psychology-oriented blog content, while `insight.click2pro.com` is being structured to convert that traffic into topic-specific assessments, premium reports, bundles, and subscriptions.

## Product Vision

Build a premium self-insight product for users who discover Click2Pro through psychology blog content and want deeper, faster, more personalized interpretation of what they are experiencing. The platform should feel serious and trustworthy, not clinical or sensational.

This is not a diagnosis product. It is an insight and pattern-analysis product designed to help users understand behavior, emotional dynamics, relationship patterns, stress signals, and internal conflict with more structure than a blog article can provide.

## Revenue Model

The product is designed around layered monetization:

- Free entry: short assessment result snapshot
- Paid single report: deeper personalized interpretation for one assessment
- Bundles: grouped reports for users with overlapping concerns
- Subscription: ongoing access to reports, progress history, and new assessments

The commercial advantage comes from monetizing existing organic traffic without manually editing a large archive of blog posts.

## User Journey

1. A user lands on a `click2pro.com` psychology blog post.
2. A popup script reads the blog URL or mapped topic category.
3. The popup offers a relevant assessment with focused positioning.
4. The user continues on `insight.click2pro.com` into the assessment flow.
5. The user receives a free insight snapshot and an offer for a deeper paid report.
6. After purchase, the user unlocks a structured premium report, bundle, or subscription path.
7. The platform can later upsell related assessments based on completed topics.

## Launch Scope

The first release is planned around 10 starter assessments:

1. Condescending Behavior Decoder
2. Imposter Syndrome Deep Report
3. Relationship Infatuation / Obsession Analysis
4. Toxic Pattern & Red Flag Report
5. Emotional Detachment / Nihilism Insight
6. Anhedonia & Motivation Pattern Scan
7. Personality Burnout & Stress Report
8. Attachment & Relationship Style Report
9. Identity & Inner Conflict Profile
10. Closure & Emotional Recovery Report

## Planned Architecture

The architecture is intentionally separated into two layers:

- `click2pro.com`: existing content site and blog traffic source
- `insight.click2pro.com`: assessment, checkout, report, and account experience

Planned platform components:

- Blog popup and topic-routing system
- Assessment engine with reusable question sets and scoring logic
- Report generation layer with free and paid output states
- OpenAI-ready narrative layer that sits on top of deterministic scoring
- Checkout, bundles, and subscription management
- Admin tools for mappings, assessments, pricing, and report content
- Analytics for conversion, report purchases, and assessment demand

The repository now includes a Next.js App Router and Tailwind CSS front-end foundation with reusable components, premium dark-theme page shells, and seeded mock assessment metadata. Backend logic, checkout, authentication, storage, and report generation are still intentionally unimplemented.

## Blog Conversion System

The blog-to-assessment conversion layer is now structured as a reusable mapping and embed system:

- Source-of-truth topic mapping: [lib/blog-popup/mappings.ts](/Users/sanjeev/Documents/click2pro-insight-platform/lib/blog-popup/mappings.ts)
- Detection and routing helpers: [lib/blog-popup/detection.ts](/Users/sanjeev/Documents/click2pro-insight-platform/lib/blog-popup/detection.ts), [lib/blog-popup/routing.ts](/Users/sanjeev/Documents/click2pro-insight-platform/lib/blog-popup/routing.ts)
- Embeddable script route: [app/embed/click2pro-insight-popup.js/route.ts](/Users/sanjeev/Documents/click2pro-insight-platform/app/embed/click2pro-insight-popup.js/route.ts)

Intended embed pattern:

```html
<script
  src="https://insight.click2pro.com/embed/click2pro-insight-popup.js"
  data-delay-ms="35000"
  defer
></script>
```

Current behavior:

- Reads the current blog URL plus page title and meta keywords when available
- Matches known topic fragments and keywords against the 10 launch assessments
- Waits about 35 seconds before showing
- Shows only once per session
- Routes to the matching assessment intro page, or falls back to the assessments library
- Keeps the popup small, dismissible, mobile-friendly, and non-blocking

## Project Map

- [AGENTS.md](/Users/sanjeev/Documents/click2pro-insight-platform/AGENTS.md)
- [package.json](/Users/sanjeev/Documents/click2pro-insight-platform/package.json)
- [app/layout.tsx](/Users/sanjeev/Documents/click2pro-insight-platform/app/layout.tsx)
- [app/page.tsx](/Users/sanjeev/Documents/click2pro-insight-platform/app/page.tsx)
- [app/assessments/page.tsx](/Users/sanjeev/Documents/click2pro-insight-platform/app/assessments/page.tsx)
- [app/dashboard/page.tsx](/Users/sanjeev/Documents/click2pro-insight-platform/app/dashboard/page.tsx)
- [components/ui](/Users/sanjeev/Documents/click2pro-insight-platform/components/ui)
- [lib/assessments.ts](/Users/sanjeev/Documents/click2pro-insight-platform/lib/assessments.ts)
- [lib/blog-popup](/Users/sanjeev/Documents/click2pro-insight-platform/lib/blog-popup)
- [lib/ai-reporting](/Users/sanjeev/Documents/click2pro-insight-platform/lib/ai-reporting)
- [lib/openai-payloads](/Users/sanjeev/Documents/click2pro-insight-platform/lib/openai-payloads)
- [lib/openai-prompts](/Users/sanjeev/Documents/click2pro-insight-platform/lib/openai-prompts)
- [lib/report-assembly](/Users/sanjeev/Documents/click2pro-insight-platform/lib/report-assembly)
- [planning/strategy/product-strategy.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/strategy/product-strategy.md)
- [planning/strategy/implementation-phases.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/strategy/implementation-phases.md)
- [planning/content/homepage-copy.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/content/homepage-copy.md)
- [planning/content/blog-to-assessment-mapping.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/content/blog-to-assessment-mapping.md)
- [planning/reports/report-structure.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/reports/report-structure.md)
- [planning/pricing/pricing-model.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/pricing/pricing-model.md)
- [planning/popup-logic/blog-popup-system.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/popup-logic/blog-popup-system.md)
- [planning/admin-notes/dashboard-admin-plan.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/admin-notes/dashboard-admin-plan.md)
- [planning/tech-architecture/planned-architecture.md](/Users/sanjeev/Documents/click2pro-insight-platform/planning/tech-architecture/planned-architecture.md)
