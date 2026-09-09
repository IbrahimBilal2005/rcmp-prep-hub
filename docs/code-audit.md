# Production behavior audit

The scan covered route guards, account restoration, dashboard navigation, signup/checkout returns, lesson rendering and completion, timed tests, admin dialogs, and responsive navigation.

## Fixes

- Practice-test loading and unknown URLs no longer dereference missing test data.
- Timed tests use an absolute deadline, including after browser sleep. Answers and the selected question survive reload in the same tab, scoped to the account and test content. Refreshed signed image URLs do not invalidate a saved attempt.
- Changing routes resets the previous page's transient state. A render or chunk-loading failure has a recovery screen.
- Lesson navigation clears old media and handles video/poster failures independently. Locked lessons do not request media URLs.
- Lesson progress writes run in order per account/module. Saving completions no longer deletes every checkmark before inserting them again. Failed reads preserve local progress, and responses for a previous account are discarded.
- Lesson completion restoration uses actual ordered lesson positions, handling sort orders starting at zero and gaps after deletion.
- Account changes clear the query cache. Malformed stored account profiles are rejected.
- Signup Back updates the URL. Practice-test return links reopen the dashboard's tests tab. Landing hash links wait for lazy sections; module recommendation links scroll to the requested lesson/quiz section.
- Checkout only reports premium activation when the restored profile actually has premium access.
- Tablet navigation remains reachable. Small-screen headers and dashboard stats fit better, sticky headers remain visible while scrolling, and dialogs have viewport margins and a scrollable maximum height.
- The upload timeout helper accepts Supabase's PromiseLike query builders, resolving the existing TypeScript errors.

## Validation

Run `npm test`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, and `npm run test:e2e`.

Browser tests build production assets and intercept the test Supabase hostname. They cover 360px, 768px, and 1440px viewports, student/admin navigation, logout, refresh, saved practice answers, missing test URLs, dialogs, and clipped controls. Screenshots are written under ignored `test-results/` directories. Windows uses installed Edge; other systems use Playwright Chromium (`npx playwright install chromium`).

These tests do not validate live credentials, payment settlement, database policies, real media delivery, or Safari-specific behavior. No production deployment or database changes were performed.

Unsaved admin edits and unfinished module-quiz answers still reset on reload. Completed progress remains saved; active timed practice tests now resume. The browser inactivity policy remains separate from Supabase's server session limits.
