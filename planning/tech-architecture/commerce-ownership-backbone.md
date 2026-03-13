# Commerce Ownership Backbone

## Purpose

The Insight Platform now has a DB-first commerce and ownership backbone that can persist:

- checkout intents
- purchase records
- owned reports
- owned bundles
- membership subscriptions
- India explanation entitlements

The current checkout is still placeholder-only, but the ownership lifecycle is no longer browser-only when an authenticated user is present.

## Core Model

Prisma now supports these commerce entities:

- `CheckoutIntent`
- `Purchase`
- `Report`
- `OwnedBundle`
- `Membership`
- `ExplanationEntitlement`

Supporting delivery/storage entities continue to live in:

- `EmailDeliveryRecord`
- `DownloadRecord`

## Purchase Intent Lifecycle

1. user chooses an offer in the existing unlock flow
2. `POST /api/checkout/session` is called
3. if the user is authenticated:
   - a persistent `CheckoutIntent` is created in the database
   - the response keeps the current success/cancel route shape
4. if the user is not authenticated:
   - the app falls back to the existing local placeholder intent flow

This keeps the current UX intact while enabling DB-backed ownership for authenticated users.

## Ownership Grant Lifecycle

`POST /api/checkout/complete` currently acts as the placeholder payment-confirmation bridge.

For authenticated users it:

1. loads the stored checkout intent
2. creates a `Purchase`
3. grants the right entitlement based on purchase type
4. creates a `Report` for the purchased assessment
5. queues account-email delivery metadata
6. marks the checkout intent as completed

Grant behavior by purchase type:

- single report:
  - creates purchase + report
- premium report:
  - creates purchase + premium-tier report
- membership:
  - creates or refreshes a membership record
  - creates purchase + report for the current assessment
- bundle:
  - creates purchase + report + owned bundle
- explanation session:
  - creates purchase + report + `ExplanationEntitlement`

## Access Resolution

Server-side access helpers live under `lib/commerce/server`.

Current DB-backed access resolution checks:

- owned report access
- bundle access
- membership access
- explanation entitlement presence

The current UI still uses the existing `CommerceState` contracts, but those contracts can now be hydrated from Prisma through:

- `GET /api/commerce/library`

That means preview/report/dashboard surfaces can resolve access from persistent data without a visual rewrite.

## DB-First With Local Fallback

The current client behavior is intentionally transitional:

- authenticated users:
  - DB-backed library loading
  - DB-backed checkout intent creation
  - DB-backed success/cancel handling
- unauthenticated users:
  - existing local placeholder ownership remains available

This preserves the current product shell while real payment integration is still incomplete.

## Stripe / Razorpay Next Step

When live payments are added, the next integration should plug into this order:

1. create `CheckoutIntent`
2. hand off to Stripe or Razorpay using the stored intent id
3. receive payment confirmation through webhook/provider verification
4. finalize purchase by confirming the existing intent instead of relying on the placeholder success route
5. grant ownership from the confirmed intent

The current placeholder success route should then become a post-confirmation UI, not the source of truth.

## Still Placeholder

Not implemented yet:

- live Stripe checkout/session creation
- live Razorpay order creation/capture
- webhook-based payment confirmation
- provider-side refund/cancel synchronization
- real explanation-session scheduling
- server-side PDF rendering
- production email delivery provider integration

The ownership model is now ready for those systems to plug in without changing the current UI structure.
