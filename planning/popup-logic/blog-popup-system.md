# Blog Popup System

## Goal

Convert existing blog traffic into relevant assessment starts without editing the full archive by hand.

## Current Implementation Structure

- Script route: `https://insight.click2pro.com/embed/click2pro-insight-popup.js`
- Mapping source: `lib/blog-popup/mappings.ts`
- Detection logic: `lib/blog-popup/detection.ts`
- Routing helpers: `lib/blog-popup/routing.ts`

## Core Flow

1. A visitor lands on a likely article page at `click2pro.com`.
2. A single embed script reads the current URL, page title, and available meta keywords or descriptions.
3. The script scores topic fragments and keywords against launch assessment mappings.
4. After roughly 35 seconds, a small popup suggests the best-fit assessment.
5. The visitor is routed to `insight.click2pro.com/assessments/[slug]`.
6. If no strong topic match exists, the popup falls back to the full assessments library.

## Current Behavior Rules

- Show once per session using session storage
- Delay popup appearance by about 35 seconds
- Keep the popup non-blocking and dismissible
- Use article-page heuristics so the script does not fire blindly on non-article pages
- Stay calm in tone and avoid urgency language

## Embed Pattern

```html
<script
  src="https://insight.click2pro.com/embed/click2pro-insight-popup.js"
  data-delay-ms="35000"
  defer
></script>
```

Optional data attributes:

- `data-insight-base-url`
- `data-delay-ms`
- `data-session-key`
- `data-article-path-hints`

## UX Notes

- Copy should feel like a thoughtful next step, not an interruption
- The popup should not block the full screen
- The CTA should lead directly to the relevant assessment intro page
- Fallback messaging should point to the library rather than force a weak recommendation

## Next-Step Admin Need

Mappings and copy variants should eventually be editable without code deployments. Analytics and impression tracking can be added later without changing the popup surface language.
