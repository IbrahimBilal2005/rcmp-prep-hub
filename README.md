# AptitudeForge Frontend

Frontend prototype for an RCMP aptitude test prep product. This phase focuses on strong UI, realistic test flow, and clean integration seams for Supabase and Stripe.

## Run locally

1. Install dependencies:

```sh
npm install
```

2. Copy the example environment file and fill values later as needed:

```sh
Copy-Item .env.example .env
```

3. Start the app on localhost:

```sh
npm run dev:localhost
```

Default local URL: `http://127.0.0.1:8080`

## Current frontend scope

- Landing page with improved "Path to Success" and pricing sections
- Dashboard with module and practice test flows
- Practice tests with:
  - timed attempts
  - local attempt history
  - post-test review and explanations
  - centered question layout with separate progress rail
- Module quizzes remain untimed

## Phase 2 integration seams

Environment variables are scaffolded in `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_6_MONTHS`
- `VITE_USE_MOCK_AUTH`
- `VITE_USE_MOCK_BILLING`

Supporting frontend files:

- `src/lib/platform.ts` for runtime config and readiness flags
- `src/data/billingPlans.ts` for Stripe-aligned plan metadata
- `src/lib/practiceTestStorage.ts` for the temporary local attempt store that can later move to Supabase

## Verification

Use these commands while iterating:

```sh
npm run lint
npm run build
```
