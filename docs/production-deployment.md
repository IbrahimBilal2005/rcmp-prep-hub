# Production deployment

Canonical origin: `https://www.aptitudeforge.ca`.

## Render static site

- Build command: `npm ci && npm run build`; publish directory: `dist`.
- Keep the apex domain redirect to `www`.
- Under Redirects/Rewrites, configure source `/*`, destination `/index.html`, action **Rewrite** (not Redirect). This serves React on dashboard, admin, lesson, and test deep links without changing the address.
- Set `VITE_APP_URL=https://www.aptitudeforge.ca`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` for the intended Supabase project.
- Set `VITE_USE_MOCK_AUTH=false` and `VITE_USE_MOCK_BILLING=false`. Production builds disable both mock modes regardless of these flags.
- Set the Stripe publishable key and six-month price variables if accepting payments.
- Optional: `VITE_SESSION_IDLE_MINUTES=60` (default). Redeploy after changing any `VITE_` variable: Vite embeds values at build time.

## Supabase

- Site URL: `https://www.aptitudeforge.ca/`.
- The existing `https://*.aptitudeforge.ca/**` redirect allowlist covers `www`. An explicit `https://www.aptitudeforge.ca/signup?mode=login` entry can replace the wildcard if no other subdomains need authentication redirects.
- Signup email confirmation explicitly returns to `/signup?mode=login`. When email confirmation is enabled, signup asks the user to check email instead of creating a fake local session.
- Stripe checkout currently returns to the request origin's `/dashboard?checkout=success` or `/signup?step=plan&checkout=cancelled`; requests from the canonical site therefore return to the canonical site.
- Keep database authorization and RLS enabled. The browser inactivity timer is a UI logout policy, not a server authorization boundary. Supabase's server session lifetime/inactivity settings are separate and are checked on token refresh; configure those too if a server-enforced lifetime is required.

## Expected behavior and verification

- Student (free and premium) and admin sessions restore from Supabase before protected routes render.
- Dashboard tabs and admin selected module/test/user are in URL query parameters and survive refresh and browser history navigation.
- An expired session goes to login and retains the original internal URL for return after login.
- Default logout is after 60 minutes without a click, keypress, touch, or scroll, shared across tabs on the same origin. Token refresh does not extend this deadline. Reloading before expiry counts as activity; reloading after expiry requires login.
- Different origins have separate browser storage. Users previously signed in on the Render hostname must sign in once on `www`.
- Practice-test answers, question selection, and review state survive refresh in the same tab for the same user. The deadline keeps running while away. Unsaved admin fields, open dialogs, and unfinished module-quiz answers are not persisted.
- After deploying, sign in with a student and admin account, open a nondefault tab, refresh, and use browser back/forward. Check an email confirmation and Stripe checkout return as applicable. Live authenticated checks require actual test accounts; automated tests use mocked Supabase responses.

References: [Render rewrites](https://render.com/docs/redirects-rewrites), [Supabase auth callbacks](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [Supabase session limits](https://supabase.com/docs/guides/auth/sessions).
