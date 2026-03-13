# Blog-to-Assessment Mapping

## Objective

Map large-scale blog traffic to the most relevant assessment without manually editing each post.

## Mapping Approach

- Primary signal: blog URL slug
- Secondary signals: page title, meta keywords, and meta description when available
- Fallback: generic assessment library recommendation

## Initial Topic Map

- `condescending`, `patronizing`, `belittling`, `talking down`, `superiority` -> `condescending-behavior-decoder`
- `imposter syndrome`, `impostor syndrome`, `self doubt`, `fraud feeling`, `not good enough` -> `imposter-syndrome-deep-report`
- `infatuation`, `obsession`, `limerence`, `mixed signals`, `cant stop thinking` -> `relationship-infatuation-obsession-analysis`
- `toxic relationship`, `red flags`, `manipulation`, `gaslighting`, `warning signs` -> `toxic-pattern-and-red-flag-report`
- `emotional detachment`, `emotionally detached`, `nihilism`, `numb`, `empty inside` -> `emotional-detachment-nihilism-insight`
- `anhedonia`, `no motivation`, `nothing feels good`, `lost interest`, `low drive` -> `anhedonia-and-motivation-pattern-scan`
- `burnout`, `stress`, `always tired`, `overwhelmed`, `high functioning exhaustion` -> `personality-burnout-and-stress-report`
- `attachment style`, `anxious attachment`, `avoidant attachment`, `relationship style` -> `attachment-and-relationship-style-report`
- `identity crisis`, `inner conflict`, `sense of self`, `who am i` -> `identity-and-inner-conflict-profile`
- `closure`, `moving on`, `letting go`, `emotional recovery`, `unfinished breakup` -> `closure-and-emotional-recovery-report`

## Routing Rules

1. Score direct slug and URL-fragment matches first.
2. Add keyword and phrase matches from the page title and metadata.
3. Break ties in favor of the more specific or higher-priority topic.
4. If confidence is weak, route to `/assessments` instead of forcing a weak topic guess.

## Popup Copy Direction

- Calm and contextual
- No urgency tactics
- Acknowledge the article theme naturally
- Position the assessment as a structured next step

## Admin Need

The mapping table should eventually be editable without code changes. For now, the source of truth lives in `lib/blog-popup/mappings.ts`.
