# Region Pricing Engine

## Purpose

The Insight Platform now resolves commerce context by region so the same product shell can present:

- international pricing in `USD` with a Stripe-oriented checkout path
- India pricing in `INR` with a Razorpay-oriented checkout path
- India-only psychologist explanation offers

This layer is intentionally provider-ready without calling live Stripe or Razorpay yet.

## Region Resolution Order

Region resolution currently follows this order:

1. authenticated user profile fields when available
   - `country`
   - `region`
   - `currency`
   - `preferredPaymentProvider`
2. cookie-backed user preference
   - `click2pro_insight_region`
3. fallback default
   - `international`

`lib/region/server.ts` is the server entry point for App Router pages/layouts.
`lib/region/resolve.ts` contains the shared resolution logic.

## Catalog Structure

`lib/region/catalog.ts` is the single source of truth for:

- region config
- currency
- preferred payment provider
- offer visibility
- fixed prices
- annual-membership emphasis

Each offer has:

- `id`
- `regionKey`
- `productType`
- `currencyCode`
- `paymentProvider`
- `priceMinor`
- optional `membershipPlan`
- optional `explanationSessionDuration`
- visibility flags for pricing page, unlock flow, assessment cues, dashboard, and recommendations

## Current Region Catalog

### International

- Single Insight Report
- Premium Deep Insight Report
- Membership Annual
- Membership Monthly

### India

- Insight Report
- Premium Deep Insight Report
- Report + 30 min Psychologist Explanation
- Report + 60 min Psychologist Explanation

India explanation offers are positioned as structured report walkthroughs, not therapy or diagnosis.

## UI Consumption

Main UI surfaces should consume region-aware values through one of two paths:

- server components/pages:
  - `getServerCommerceRegionContext()`
  - `getPricingLabels(regionKey)`
  - `getMembershipContent(regionKey)`
- client components:
  - `useCommerceRegion()`

Avoid hardcoding prices directly inside UI components.

## Future Checkout Integration

When live billing is added:

1. determine the region context first
2. resolve the selected catalog offer
3. use the offer's `paymentProvider` to branch into Stripe or Razorpay session creation
4. persist checkout intent with region, currency, provider, and offer metadata
5. confirm payment through provider-specific verification/webhooks
6. grant report ownership or recurring access using the existing commerce ownership layer

Suggested next integration points:

- Stripe:
  - use international catalog offers only
- Razorpay:
  - use India catalog offers only
- recurring logic:
  - only expose recurring checkout for regions with `supportsMembership`

## Current Non-Goals

Still intentionally not implemented:

- IP geolocation
- live Stripe checkout
- live Razorpay checkout
- real webhook handling
- live psychologist scheduling
- booking confirmation flows
- region-specific tax handling
- currency conversion logic

The current goal is a clean, centralized pricing and offer layer that later checkout systems can trust.
