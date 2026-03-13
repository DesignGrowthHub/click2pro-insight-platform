# Live Payment Integration

## Stripe flow
- `POST /api/checkout/session` creates an internal `CheckoutIntent` first, then creates a live Stripe Checkout Session when Stripe is configured and the user is authenticated.
- Stripe success returns to `/checkout/success?intent=...&provider=stripe`.
- Stripe cancel returns to `/checkout/cancel?intent=...&provider=stripe`.
- `POST /api/stripe/webhook` is the primary confirmation path.
- The success screen calls `POST /api/checkout/complete` as a safe verification fallback if the webhook has not finalized ownership yet.

## Razorpay flow
- `POST /api/checkout/session` creates an internal `CheckoutIntent` first, then creates a live Razorpay order for India-eligible offers.
- The client launches Razorpay Checkout from the returned order payload.
- After payment, the client posts signed order/payment data to `POST /api/razorpay/verify`.
- `POST /api/razorpay/webhook` can also confirm or fail orders from provider-originated events.
- Successful verification routes the user into the existing `/checkout/success` screen.

## Checkout intent lifecycle
1. Create `CheckoutIntent` with pricing, user, region, provider, and target assessment/report metadata.
2. Provider session or order is created and attached back to the intent.
3. Intent moves to `REQUIRES_ACTION` while the user is in Stripe or Razorpay checkout.
4. Verified payment moves the intent to `PAID`.
5. Failed, canceled, or expired provider outcomes update the same intent instead of creating a second state model.

## Ownership grant lifecycle
- All verified provider outcomes converge into `confirmPersistentCheckoutIntentPayment(...)`.
- That function creates:
  - `Purchase`
  - `Report`
  - `Membership` when relevant
  - `OwnedBundle` when relevant
  - `ExplanationEntitlement` for India explanation offers
- The dashboard library and access checks read those persisted records through the existing commerce library layer.

## What Stripe and Razorpay plug into next
- Production deployment still needs live environment variables in the hosting platform.
- Stripe should have webhook delivery configured to `/api/stripe/webhook`.
- Razorpay should have webhook delivery configured to `/api/razorpay/webhook`.
- Real production monitoring, retry handling, refund/reversal handling, and membership renewal webhooks still need to be completed before launch hardening is finished.
