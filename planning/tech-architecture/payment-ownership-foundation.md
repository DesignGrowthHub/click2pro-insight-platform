# Payment And Ownership Foundation

## Current Scope
- Checkout session creation placeholder lives in `/Users/sanjeev/Documents/click2pro-insight-platform/app/api/checkout/session/route.ts`.
- Stripe environment readiness and placeholder session descriptors live in `/Users/sanjeev/Documents/click2pro-insight-platform/lib/commerce/stripe.ts`.
- Client-side placeholder ownership persistence lives in `/Users/sanjeev/Documents/click2pro-insight-platform/lib/commerce/ownership-store.ts`.
- Access decisions for preview vs full-report rendering live in `/Users/sanjeev/Documents/click2pro-insight-platform/lib/commerce/access.ts`.
- Dashboard ownership rendering lives in `/Users/sanjeev/Documents/click2pro-insight-platform/components/dashboard/dashboard-ownership-experience.tsx`.

## Real Stripe Integration Points
1. Create the real Stripe Checkout Session inside `/Users/sanjeev/Documents/click2pro-insight-platform/app/api/checkout/session/route.ts`.
2. Replace the placeholder redirect URLs with the real Stripe `url` from the created Checkout Session.
3. Persist the checkout intent and purchase draft before redirecting so the success route can reconcile UI state immediately.
4. Use `/Users/sanjeev/Documents/click2pro-insight-platform/app/api/stripe/webhook/route.ts` to verify `checkout.session.completed` and subscription events with `STRIPE_WEBHOOK_SECRET`.

## Persistence Flow
1. Checkout session is created from a `CheckoutIntent`.
2. After Stripe confirmation, persist a `PurchaseRecord`.
3. Grant `OwnedReport`, `OwnedBundle`, or `SubscriptionRecord` based on the paid product.
4. Persist report delivery state, PDF generation state, and dashboard ownership together.
5. Use the access-check layer to decide whether a report renders preview-only or full access.

## Environment Variables
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Replace Next
- Move ownership persistence from local storage into the real account data store.
- Trigger PDF generation and email delivery after the purchase is confirmed.
- Attach source blog attribution to the saved purchase and owned report records.
- Replace the placeholder success flow with server-confirmed ownership once webhooks are active.
