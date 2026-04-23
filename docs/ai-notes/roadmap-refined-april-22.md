---
Version: 2.0.0
Created: 2026-04-22
Supersedes: sprint-2-roadmap.md, sprint-2-execution-notes.md (still readable for history)
Horizon: Apr 22, 2026 → Aug 2026 (launch + 90 days)
Owner: Darin Levesque
---

# Refined Roadmap — Apr 22, 2026

This document is the active plan. It answers four questions at every horizon:

1. **What is done** (verified against codebase, not self-report).
2. **What remains to ship by May 18** (the launch date).
3. **What we will deliberately defer** (and why it is safe to defer).
4. **How we will evolve after launch** (continuous improvement from real users).

If a task below conflicts with an earlier sprint doc, this file wins.

---

## Part 1 — Remainder of Sprint 2 (Apr 22 → May 3, 11 days)

Goal: close the Sprint 2 exit criteria from `roadmap-mvp.md` §5 and clean up the gaps surfaced in today's audit (`sprint-2-status-april-22.md`).

Each task below has: owner · effort estimate · dependencies · definition of done (DoD).

### P0 — Must land before May 3

**1. Email service end-to-end verification** · Darin + Claude · 2h · None
- Confirm Resend API key is set in `.env.local` on both laptop and Vercel preview env.
- Sign up with a throwaway Gmail, receive verification email, click link, reach `/auth/verify-email` success state.
- Reset password with the same account, receive reset email, reset, log in.
- **DoD**: Two screenshots captured in `docs/ai-notes/evidence/email-e2e-apr-YYYY.png`; Resend dashboard shows the sends.

**2. OAuth live testing (Google + GitHub)** · Darin · 2h · OAuth apps registered
- Create Google OAuth app in Google Cloud Console with `databreef.io/api/auth/callback/google` callback.
- Create GitHub OAuth app with `databreef.io/api/auth/callback/github` callback.
- Add `GOOGLE_ID`, `GOOGLE_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` to `.env.local` and Vercel.
- Sign in with each provider on localhost; verify a `users` row is created.
- **DoD**: Both providers produce a user row; user can sign out and back in via OAuth.

**3. Audit log viewer at `/settings/audit`** · Claude · 3-4h · Needs `audit_events` table (exists)
- New route `src/app/(app)/settings/audit/page.tsx`.
- Paginated table: timestamp, actor (user email), action, target (reef id / dib id), source IP, user agent.
- Filter by action type + date range.
- Empty state when user has zero events.
- **DoD**: Route renders for an authenticated user; page passes a11y basics (axe in dev tools, no criticals); route linked from `/settings`.

**4. MS SQL adapter (staging, behind `mssql_preview` flag)** · Claude · 5-6h · MySQL adapter as reference
- New file `src/lib/introspection/engines/mssql.ts` modeled on `mysql.ts`.
- New connection client at `src/lib/db/adapters/mssql-client.ts` using `mssql` npm package, TLS required, `APPLICATIONINTENT=READONLY`.
- Wire through the introspection engine strategy with a preview flag gate.
- Integration test against a Testcontainers MS SQL image (or skip in CI with a documented env flag if Testcontainers SQL image is too heavy — a mocked unit test is an acceptable fallback this sprint).
- **DoD**: With flag on, a reef can be anchored to MS SQL Server 2019+ and its catalog listed; flag off, adapter is invisible in the UI.

**5. Adapter conformance suite (shared)** · Claude · 4h · Postgres + MySQL adapters
- Extract current `__tests__/adapters/mysql.test.ts` into a parameterized suite under `__tests__/adapters/_conformance.ts`.
- Each engine (Postgres, MySQL, MS SQL) runs the same test list: connect, forbidden-statement rejection, catalog read, audit-log emission, timeout, SSL enforcement.
- Run locally against Testcontainers; CI runs the mocked variant until we have infra for real-DB CI (deferred to Sprint 4).
- **DoD**: `pnpm test` shows at least the Postgres and MySQL rows of the matrix green; MS SQL skipped with a `TODO` until flag removal.

**6. SEO skeleton (sitemap + robots + OG + JSON-LD)** · Darin + Claude · 4h · None
- Create `apps/marketing/public/robots.txt` (5 lines: allow `/`, disallow `/dashboard` and `/settings`, link to sitemap).
- Extend the existing `sitemap.xml` generator to include every page under `apps/marketing/src/pages/` automatically.
- Build the dynamic OG image route (SVG → PNG at build time) and wire it into `<meta property="og:image">` on `/`, `/pricing`, `/security`.
- Add JSON-LD (`Organization`, `SoftwareApplication`) to `/` and `SoftwareApplication` + `FAQPage` to `/pricing`.
- **DoD**: Google's Rich Results test validates `/` and `/pricing`; `curl databreef.io/robots.txt` returns 200; an OG image is visible in `twitter-card-validator`.

### P1 — Strong should-have before May 3

**7. Encryption decision: GCM migration or doc update** · Darin · Decision + 0-6h
- Audit `src/lib/encryption.ts`. CryptoJS defaults to AES-CBC, not GCM.
- Decision: either (a) migrate to `node:crypto` `aes-256-gcm` + envelope structure (per-tenant DEK wrapped by platform KEK), or (b) update roadmap §4.B + security page copy to match what actually ships (pure AES-256-CBC with HMAC integrity).
- If migrating: new module `src/lib/crypto/envelope.ts`; migration script to re-encrypt existing `sources.connection_string` values; version tag in the ciphertext so old rows stay readable during migration.
- **DoD**: Either a matching security-page page describes the current mechanism honestly, or the code matches the page claim. One or the other.

**8. MySQL adapter conformance run green in CI** · Claude · 1-2h · Task 5
- The existing `__tests__/adapters/mysql.test.ts` must execute in the GitHub Actions matrix.
- **DoD**: PR to `main` with a small mysql.ts change triggers the test and passes.

**9. Sentry + Axiom + Better Stack wiring verification** · Darin + Claude · 2-3h · Accounts provisioned
- Throw a test error in a hidden route; confirm it appears in Sentry within 1 minute.
- Grep a test log line in Axiom.
- Trigger a Better Stack uptime alert by taking down a preview deployment.
- **DoD**: Three screenshots committed to `docs/ai-notes/evidence/observability-wired-apr-YYYY.png`.

### P2 — Nice-to-have, fine to slip to Sprint 4 if needed

**10. `/security/<engine>` pages (Postgres, MySQL, MS SQL)** · Darin · 3h · Marketing skeleton
- Three content pages describing each engine's read-only mechanism, what DataBreef sends over the wire, expected DB permissions.
- **DoD**: Pages live; linked from `/security` and the anchor-a-reef form.

**11. Pen-test vendor contract signed** · Darin · 1h outreach + waiting · None
- Roadmap §9 says this was due Apr 24. Send the intake form to the chosen vendor this week.
- **DoD**: Signed SoW; kickoff date on calendar (target May 11, the first day of Sprint 4).

### Sprint 2 Exit Gate — May 3

On May 3, run through this list aloud. Ship only if all P0 green:

- [ ] Email verify + password reset both round-trip through Resend (task 1).
- [ ] OAuth sign-in works with Google and GitHub (task 2).
- [ ] `/settings/audit` renders real events (task 3).
- [ ] MS SQL adapter anchors a reef behind the preview flag (task 4).
- [ ] Conformance suite covers Postgres + MySQL (task 5).
- [ ] `robots.txt` live, JSON-LD on `/` + `/pricing`, OG images rendering (task 6).
- [ ] Encryption story is honest — either GCM shipped or docs say CBC (task 7).
- [ ] Pen-test contract signed; kickoff on the calendar (task 11).

Total remaining effort: **28-36h across 11 days**. Comfortable buffer.

---

## Part 2 — Sprint 3: Commerce (May 4 → May 10)

This is the single largest sprint by scope. Stripe, account management, MFA, and plan gating all land here. None exists in code today.

### Workstream: Payments

**S3-1. Stripe account + test-mode plumbing** · Darin + Claude · 6h
- Verify the Stripe business account (Darin started this in Sprint 1 per `roadmap-mvp.md` §9 — close the loop).
- Define prices in Stripe test mode: Free, Tide ($19/mo), Current ($79/mo), Gulfstream (placeholder).
- Create `src/lib/stripe/client.ts` (server-only SDK wrapper) and `src/lib/stripe/prices.ts` (plan → price id map).
- **DoD**: A dev can call `listPrices()` from a script and see the four tiers.

**S3-2. Stripe Checkout for signup → subscription** · Claude · 6h · S3-1
- `/api/billing/checkout` route that creates a Checkout Session for the current user.
- Redirect back to `/settings/billing` on success.
- Idempotency key derived from `userId + priceId + ts/60s`.
- **DoD**: Darin's personal card produces a test-mode $19 charge; `users.stripe_customer_id` populated.

**S3-3. Webhook handler with replay-safe idempotency** · Claude · 5h · S3-1
- `/api/webhooks/stripe` route verifying the signing secret.
- New table `stripe_webhook_events(id, type, stripe_event_id unique, payload, received_at, processed_at, status)`.
- Handle `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- Downgrade on `subscription.deleted`; upgrade on `subscription.updated`; enter grace period on `payment_failed`.
- **DoD**: `stripe listen` replay of the same event twice results in a single state change (idempotency proven).

**S3-4. Customer Portal + invoice history** · Claude · 3h · S3-2
- Deep-link from `/settings/billing` to the Stripe-hosted Customer Portal.
- Display current plan + next invoice in our own UI.
- **DoD**: A test user can change payment method, download an invoice, cancel subscription, all via the portal.

**S3-5. Plan gating middleware** · Claude · 4h · S3-3, `plan_features` table
- New table `plan_features(plan, feature, limit)` seeded with the §4.C matrix (reefs, Dibs/month, MFA required, MS SQL access, etc.).
- Middleware helper `requireFeature('mssql_preview')` + `checkLimit('reefs', userId)` used in every gated route.
- No hard-coded plan names in UI or API handlers — always lookup against `plan_features`.
- **DoD**: A Free user hitting `/anchor?engine=mssql` is redirected to `/pricing#current`; a Tide user's 6th reef is blocked with a clear upgrade CTA.

**S3-6. Tax + VAT verification** · Darin · 2h · S3-2
- Enable Stripe Tax; capture VAT ID field on checkout for B2B.
- Test checkout from a US ZIP, UK postcode, and DE postcode; verify tax line shows correctly.
- **DoD**: Three screenshots committed.

### Workstream: Account Management

**S3-7. Settings pages: profile, security, team, data, api-keys** · Claude · 10h · Auth system
- Scaffold all five under `src/app/(app)/settings/`. Profile + security first, then billing (from S3-4), then team + data + api-keys.
- Profile: name, avatar (Supabase Storage), email change with verification.
- Security: password change, MFA setup (S3-9), active sessions list, sign out everywhere.
- Team: invite by email (paid plans only), roles (owner / admin / viewer), remove, transfer ownership.
- Data: export JSON archive, delete account (30-day grace, email confirm).
- API keys: personal access tokens (Gulfstream only), scoped, shown once.
- **DoD**: Every roadmap §4.D bullet has a real page; account deletion flow wipes Supabase + Stripe customer (via customer.delete) + Sentry.

**S3-8. Session management UI** · Claude · 3h · S3-7
- List active sessions with device + IP + last-seen.
- Revoke individual session + "sign out everywhere" button.
- **DoD**: Darin can revoke his phone session from his desktop and see the phone log out.

**S3-9. MFA (TOTP + backup codes)** · Claude · 6h · S3-7
- TOTP provisioning flow on `/settings/security/mfa`: show QR code, user enters 6-digit from authenticator, server verifies + stores secret encrypted.
- Generate 10 single-use backup codes, shown once.
- Require TOTP on sign-in for any user on a paid plan (enforced in `auth.ts` signIn callback).
- **DoD**: Darin's own account on Tide cannot sign in without TOTP; backup code consumed after single use.

### Workstream: Quality

**S3-10. Accessibility pass #1** · Claude · 3h · Settings pages
- axe-core added to Playwright E2E tests covering sign-up → anchor → dashboard → settings.
- Fix every P0/P1 violation before Sprint 3 exit.
- **DoD**: CI fails if axe finds a new critical issue.

### Sprint 3 Exit Gate — May 10

- [ ] Darin can sign up, pay for Current, upgrade to Gulfstream, downgrade, cancel, and get a refund — all via self-service.
- [ ] Stripe webhook replay is idempotent.
- [ ] Every paid feature is gated through `plan_features`; no hard-coded strings.
- [ ] Darin's own paid account has MFA enabled end-to-end.
- [ ] All `/settings/*` pages exist and are functional.
- [ ] Account deletion is proven to wipe data across all systems.

Estimated Sprint 3 effort: **48h across 7 days**. Tight; contingency is to defer S3-10 a11y pass to Sprint 4.

---

## Part 3 — Sprint 4: Surface + Launch Gate (May 11 → May 17)

### Workstream: Security Validation

**S4-1. Pen-test execution** · External vendor + Darin · 5 days (May 11-15) · Contract from task 11
- Vendor runs against staging with a Gulfstream-tier test account.
- Daily triage with Darin; P0/P1 fixes start same day.
- **DoD**: Written report received by May 15; P0+P1 closed by May 17; P2+P3 logged in GitHub with owner + date.

**S4-2. Secret scanning + pre-commit hooks** · Claude · 2h · None
- `gitleaks` pre-commit hook configured; GitHub secret scanning already on.
- Semgrep in CI with a starter ruleset (OWASP Top 10).
- **DoD**: A test commit containing `AWS_SECRET_ACCESS_KEY=AKIA...` is blocked.

**S4-3. Legal pages final + counsel review** · Darin + Counsel · 4h · First draft from Sprint 1
- ToS, Privacy, AUP, Subprocessor List, DPA PDF all live.
- Counsel review turnaround: draft May 4 → final May 11 (already booked per §9).
- **DoD**: All five pages linked from the marketing footer.

### Workstream: Performance + Polish

**S4-4. Lighthouse CI budgets** · Claude · 4h · Marketing pages
- Budgets: LCP < 1.8s, CLS < 0.05, INP < 200ms, TBT < 150ms, 95+ Performance, 100 SEO/A11y/BP.
- CI job fails if any page regresses.
- **DoD**: 10 consecutive green runs on `main`.

**S4-5. 3-step onboarding tour** · Claude · 4h · Dashboard
- First-time user sees: "Anchor your first reef" → "Run your first dive" → "Surface your first Dib".
- Dismissible; re-enterable from `/settings/profile`.
- **DoD**: Fresh account sees the tour automatically.

**S4-6. Status page + fire drill** · Darin · 2h · Better Stack account
- `status.databreef.io` live, publicly linked from the marketing footer.
- Run one mock incident end-to-end: detect → page Darin → update status page → resolve → post-mortem.
- **DoD**: Drill write-up in `docs/runbooks/drill-2026-05-YY.md`.

**S4-7. Launch assets** · Darin · 6h · Content
- Product Hunt gallery + tagline variants + maker comment.
- Hacker News Show HN post drafted.
- LinkedIn + X announce posts scheduled.
- Three seed blog posts published by May 16.
- **DoD**: All drafts in `content/launch/` with a published-at date.

### Workstream: Final Test

**S4-8. E2E test suite + accessibility audit** · Claude · 6h · Everything
- Playwright covers: sign-up → anchor Postgres → anchor MySQL → MS SQL blocked for Free → upgrade to Current → MS SQL unlocks → surface a Dib → share Dib publicly → cancel → refund.
- Manual NVDA + VoiceOver pass on marketing + app core routes.
- **DoD**: `pnpm test:e2e` green; one a11y issue sheet in `docs/ai-notes/a11y-audit-may-YY.md`.

**S4-9. Backup restore drill** · Darin · 3h · Supabase PITR
- Restore a recent backup to a clean Supabase project; verify data integrity.
- **DoD**: Write-up in `docs/runbooks/restore-drill-2026-05-YY.md`.

### Go / No-Go — May 17

The full `roadmap-mvp.md` §11 pre-flight checklist runs on this day. The launch captain (Darin) reads it aloud. Every line ✅ before the Go.

---

## Part 4 — Launch Day: May 18, 2026

Public announce, paid acquisition begins. Single change from the mvp plan: the first 24 hours are watched in person — Darin on-call with phone unlocked and the status page tab pinned.

Acceptance criteria are the `roadmap-mvp.md` §10 metrics, measured at T+30 days:

- ≥ 99.9% uptime, zero P0 security incidents.
- ≥ 100 signups, ≥ 10 paid conversions, ≥ 50 Dibs surfaced.
- p75 LCP < 2.0s on marketing.
- Support first-response < 24h on every paid ticket.
- Churn < 10% in the first month on paid plans.

---

## Part 5 — Post-Launch (v1.1 horizon, May 19 → Aug 2026)

The point of launching is to get real user signal. The plan below is the **structure** we commit to; the **content** of each sprint is driven by customer feedback (see §6).

### Cadence after launch

- **Sprint length**: 2 weeks.
- **Sprint 5** (May 19 → Jun 1): launch stabilization. No new features. Watch errors, triage support, burn down pen-test P2/P3.
- **Sprint 6** (Jun 2 → Jun 15): first customer-driven sprint — themes selected from the Jun 1 feedback review.
- **Sprint 7** and beyond: same rhythm.

### v1.1 Candidate Work (order TBD by customer feedback)

These were deliberately deferred from MVP and remain in the backlog:

- Snowflake adapter (major enterprise ask signal since launch).
- MongoDB adapter (NoSQL demands its own Dib schema — 3-4 weeks).
- Oracle adapter (enterprise only).
- SSO/SAML for Gulfstream tier.
- SOC 2 Type I evidence collection.
- LLM-assisted Dib narrative copy (current pipeline is rules-based).
- Public API + webhooks for customers.
- Self-hosted Docker image GA.
- Mobile-optimized Dib reader (PWA).

Each gets pulled forward when enough feedback demands it — not before.

### Engineering Hygiene (always-on after launch)

- **Test coverage climb**: from ~5 test files today → 70% coverage on `src/lib/` by end of Sprint 6.
- **Runbook expansion**: every sev-1/2 incident produces a new runbook within 5 business days.
- **Dependency updates**: Renovate PRs merged within 7 days of open (weekly sweep).
- **Pen-test cadence**: re-scope with vendor for Q4 2026.
- **Performance budget enforcement**: Lighthouse CI remains green; any regression blocks the PR.

---

## Part 6 — Continuous Improvement Framework (post-launch)

Separate document: [`continuous-improvement-framework.md`](./continuous-improvement-framework.md). Read it before Sprint 5 planning.

Summary: every piece of customer-facing feedback is captured, tagged, scored, and fed into the sprint-planning intake. No ad-hoc decisions; every feature we build traces back to a labeled signal.

---

## Change Log

- **2026-04-22** — v2.0.0 — Initial refined roadmap. Supersedes sprint-2-* planning docs. Folds in Apr 22 audit findings (audit viewer gap, encryption concern, test coverage, robots.txt). Extends horizon to Aug 2026 with continuous-improvement framework for post-launch. (Claude, scheduled task)
