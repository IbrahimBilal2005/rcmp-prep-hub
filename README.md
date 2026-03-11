# AptitudeForge

Premium RCMP aptitude test preparation frontend built with React, TypeScript, Vite, Tailwind, and shadcn/ui.

It includes a polished landing page, gated free-vs-premium access flow, a training dashboard, lesson-based modules, untimed module quizzes, and timed practice tests with saved local progress.

## Overview

This app is designed as a frontend foundation for an RCMP / police aptitude preparation product.

Current product goals:

- Present a credible premium landing experience
- Support a free preview path and a premium access path
- Let users move through modules, lessons, quizzes, and practice tests
- Persist study progress locally while backend integrations are being finalized
- Keep clear integration seams for Supabase auth/data and Stripe billing

## Current Experience

### Landing

- Premium marketing homepage
- Module, pricing, and process sections
- Fixed navigation with in-page section jumps

### Training Hub

- Dashboard for modules and practice tests
- Module detail pages with lesson completion tracking
- Untimed module quizzes
- Timed practice tests with attempt history and score review

### Access Model

- Free preview users can access:
  - Module `1`
  - First `2` lessons in the preview module
  - First `2` quiz questions in the preview module
  - The `numerical` practice test
  - First `3` questions of the preview practice test
- Premium users can access the full module and test library

## Completion Rules

Modules are only marked as complete when:

- every lesson in the module is marked complete
- the module quiz is finished with a `100%` score

This rule is used in the dashboard and module views. There is no separate hard-coded completion state for free or premium.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router
- Vitest

## Quick Start

### 1. Install dependencies

```sh
npm install
```

### 2. Create your local env file

```powershell
Copy-Item .env.example .env
```

### 3. Run the app

```sh
npm run dev:localhost
```

Local URL:

```txt
http://127.0.0.1:8080
```

## Available Scripts

```sh
npm run dev
npm run dev:localhost
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
```

## Environment Variables

Defined in `.env.example`:

```txt
VITE_APP_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_STRIPE_PRICE_6_MONTHS
VITE_STRIPE_CHECKOUT_URL
VITE_USE_MOCK_AUTH
VITE_USE_MOCK_BILLING
```

Notes:

- `VITE_USE_MOCK_AUTH` defaults to mock auth unless explicitly set to `false`
- `VITE_USE_MOCK_BILLING` defaults to mock billing unless explicitly set to `false`
- Stripe is considered ready when checkout URL or publishable key + price ID are configured

## Project Structure

```txt
src/
  components/
    brand/
    dashboard/
    landing/
    ui/
  config/
  data/
  lib/
  pages/
  providers/
  services/
```

High-signal files:

- `src/pages/Index.tsx` - landing page composition
- `src/pages/Dashboard.tsx` - training dashboard
- `src/pages/ModuleDetail.tsx` - lesson and quiz flow
- `src/pages/PracticeTestView.tsx` - timed test flow
- `src/data/courseData.ts` - module and practice test content
- `src/lib/access.ts` - free preview and premium access rules
- `src/lib/moduleProgressStorage.ts` - module progress persistence
- `src/lib/practiceTestStorage.ts` - practice test persistence
- `src/config/app.ts` - app config and integration readiness flags

## Integration Status

The app is already structured to support:

- Supabase authentication and user data
- Stripe billing / checkout
- mock auth and billing fallbacks during frontend development

Key integration files:

- `src/config/app.ts`
- `src/lib/auth.ts`
- `src/lib/billing.ts`
- `src/lib/supabaseClient.ts`
- `src/data/billingPlans.ts`
- `src/services/`

## Verification

Recommended checks while working:

```sh
npm run lint
npm run test
npm run build
```

## Notes

- Progress is currently stored locally in browser storage
- Landing-page anchor navigation and route changes reset scroll correctly
- The current visual direction is tuned toward a premium RCMP / police exam-prep feel rather than a generic SaaS theme
