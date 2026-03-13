# Backend Foundation

## What this layer adds

- Prisma schema for the core account, purchase, report, attribution, and delivery records
- Credentials-based Auth.js / NextAuth foundation for `App Router`
- Secure password hashing with `bcryptjs`
- Server-side service modules for users, sessions, purchases, memberships, and reports
- A transition helper so the current UI can keep using seeded/local state until DB-backed mode is enabled

## Current schema models

- `User`
- `AssessmentSession`
- `Report`
- `Purchase`
- `Membership`
- `ExplanationSession`
- `SourceAttribution`
- `EmailDeliveryRecord`
- `DownloadRecord`

## Auth flow

1. `POST /api/auth/register` creates a user record with a hashed password.
2. `next-auth` credentials auth verifies email and password against Prisma.
3. Sessions use JWT strategy for now, so no session table is required yet.
4. Server helpers in `lib/auth/session.ts` expose:
   - `getAuthSession()`
   - `getCurrentUser()`
   - `requireAuthenticatedUser()`

## Future payment and report steps

- Checkout session creation should eventually create a `Purchase` in `PENDING` state.
- Stripe or Razorpay webhook confirmation should move `Purchase.status` to `PAID`.
- Paid confirmation should create or unlock `Report` records tied to that purchase.
- Membership renewals should create additional `Purchase` records linked to the same `Membership`.
- PDF generation and email delivery providers should update `Report`, `EmailDeliveryRecord`, and `DownloadRecord`.

## Current transition path

- `INSIGHT_DATA_SOURCE=local_demo` keeps the existing front-end ownership flows active.
- `INSIGHT_DATA_SOURCE=database` is the flag intended for the next step when dashboard/report views start reading from persisted user records.
- This keeps the current UI stable while the backend foundation is added underneath it.
