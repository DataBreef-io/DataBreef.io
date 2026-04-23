# DataBreef — MVP Launch Roadmap

> **Version**: 1.0.0 · **Created**: 2026-04-16 · **Target launch**: 2026-05-18
> **Owner**: Darin Levesque
> **Supersedes**: Nothing. **Incorporates**: `docs/roadmap-data-sources.md` (see summary in §3)
> **Principle**: *No "beta" tag hides an insecure product.* Everything that ships at launch must be enterprise-grade.

---

## 1. North Star

Publish the first public, paid release of DataBreef — **secure, performant, and trustworthy from the first login**. "MVP" here means **minimum *viable* product**, not minimum *anything*. We ship less scope, not lower quality.

Three promises we cannot break on launch day:

1. **Read-only is real.** Users must be able to cryptographically verify that DataBreef cannot mutate their reef.
2. **Money works.** Signups, subscriptions, upgrades, downgrades, cancellations, and refunds all complete without a human in the loop.
3. **The lights stay on.** Observability, uptime monitoring, and on-call rotation exist *before* the first customer transaction.

---

## 2. Timeline — Four Sprints to Launch

| Sprint | Dates (2026) | Theme | Exit Criterion |
|---|---|---|---|
| **Sprint 1 — Foundation** | Apr 20 – Apr 26 | Auth, schema, security primitives | A signed-in user can anchor a Postgres reef end-to-end with audit logs visible |
| **Sprint 2 — Breadth** | Apr 27 – May 3 | Data-source engines + introspection hardening | MySQL adapter in production; MS SQL in staging; adapter test matrix green |
| **Sprint 3 — Commerce** | May 4 – May 10 | Payments, subscriptions, account management | A user can sign up, pay, upgrade, downgrade, and cancel via self-service |
| **Sprint 4 — Surface** | May 11 – May 17 | SEO, social, performance, legal, launch gate | Full pre-flight checklist (§11) signed off; soft launch opens |
| **Launch day** | **May 18** | Public announce | Public announce + paid acquisition begins |

Dates are the *latest acceptable* finish — earlier is better. Each sprint ends on a Sunday at 23:59 PT with a written demo note in `docs/ai-notes/progress.md`.

---

## 3. Data Sources — Summary of the Full Plan

The full strategy lives in `docs/roadmap-data-sources.md`. For launch the connector matrix is compressed to what we can *guarantee* is secure:

| Engine | Launch Status | Read-Only Mechanism | Security Manifest |
|---|---|---|---|
| **PostgreSQL** | ✅ GA — day 1 | `SET default_transaction_read_only = ON;` | `GRANT SELECT ON ALL TABLES` recommended role |
| **MySQL / MariaDB** | ✅ GA — day 1 (goal) | `SET SESSION TRANSACTION READ ONLY;` + `GRANT SELECT` | Replica-only role recommended |
| **MS SQL Server** | 🟡 **Preview** — behind flag | `APPLICATIONINTENT=READONLY` + `db_datareader` | Preview tag in UI; no SLA |
| **Snowflake** | 📅 Post-launch (Sprint 5) | Role-based SaaS-native | Defer |
| **Oracle** | 📅 Post-launch | `SET TRANSACTION READ ONLY;` | Defer |
| **MongoDB** | 📅 Post-launch | `readPreference=secondaryPreferred` | Defer — NoSQL needs its own Dib schema |

**Adapter contract for *every* launch engine** (no exceptions):

1. Implements `IntrospectionEngine` strategy interface in `apps/app/src/lib/introspection/engines/`.
2. Passes the adapter conformance suite: connection, catalog read, forbidden-statement rejection, audit-log emission, timeout handling, SSL/TLS enforcement.
3. Ships with a user-facing Security Manifest page under `apps/marketing/src/pages/security/<engine>/`.
4. Has a synthetic monitor pinging a honeypot test instance every 5 minutes.

The full adapter lifecycle checklist from the original data-sources doc moves to `docs/adapters/checklist.md` in Sprint 2.

---

## 4. Workstreams

Work is organized into eight parallel streams. Each has a clear definition-of-done; none is optional.

### A — Identity & Access (Auth.js v5 + Supabase)

- Auth.js v5 configured in `apps/app/src/lib/auth.ts` with dual-mode (`AUTH_PROVIDER=supabase` / `oidc`).
- Supabase adapter wired (`apps/app/src/lib/adapters/supabase.ts`) with Drizzle session storage.
- Email + password, Google OAuth, GitHub OAuth — all three live on day one.
- **Password security**: argon2id hashing, zxcvbn strength meter on sign-up, breached-password check against HIBP k-anonymity API.
- **MFA**: TOTP mandatory for any account on a paid plan; backup codes with one-time reveal.
- Email verification required before anchoring a reef.
- Password reset flow with single-use signed tokens (15-minute TTL).
- Session management: list active sessions, revoke individually, global sign-out.
- Rate limiting: 5 failed logins per 15 minutes per IP + per account; IP-reputation check via Cloudflare Turnstile on sign-up.
- CSRF: Auth.js default + double-submit cookie for non-Auth.js mutating routes.

### B — Data Sources & Introspection

- See §3. Deliverables:
  - PostgreSQL adapter hardened: SSL-required, channel-binding when available, statement timeout per query, idle-in-txn timeout.
  - MySQL adapter new: TLS-required, `innodb_read_only` probe, information_schema introspection.
  - MS SQL adapter (preview): encrypted connection, named-instance support.
  - Unified audit-log table (`audit_events`) with append-only constraint + weekly hash-chained export.
  - Connection-string encryption: AES-256-GCM with a per-tenant data key wrapped by a platform KEK (envelope encryption).

### C — Payments & Subscriptions

- **Provider**: Stripe (Billing + Tax + Customer Portal).
- Price catalog:
  - **Free**: 1 reef, 1 Dib/week, community support, watermark on shared Dibs.
  - **Tide** ($19/mo): 5 reefs, 50 Dibs/month, MFA, email support.
  - **Current** ($79/mo): 25 reefs, unlimited Dibs, MS SQL preview access, priority support, team seat (1 extra).
  - **Gulfstream** (contact): unlimited reefs, SSO/SAML, audit-log export API, dedicated Slack channel.
- Stripe Checkout for signup, Customer Portal for self-service upgrade / downgrade / cancel / invoice history.
- Webhooks: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` with idempotency keys stored in `stripe_webhook_events` table.
- **Tax**: Stripe Tax enabled (US sales tax + EU VAT + UK VAT). VAT ID capture for B2B.
- **Dunning**: Stripe Smart Retries + grace period (3 days) before feature downgrade.
- **Refund policy**: 14-day no-questions-asked, automated via support email keyword trigger.
- Feature gating via a `plan_features` table + middleware; no plan logic hard-coded in UI.

### D — User Accounts & Settings

- `/settings/profile` — name, avatar (Supabase Storage), email change w/ verification.
- `/settings/security` — password change, MFA setup, active sessions, sign out everywhere.
- `/settings/billing` — current plan, next invoice, payment method, invoice history, Stripe portal deep link.
- `/settings/team` — invite member (paid plans), role (owner/admin/viewer), remove, transfer ownership.
- `/settings/data` — export my data (JSON archive), **delete my account** (hard-delete with 30-day grace + email confirmation).
- `/settings/api-keys` — personal access tokens (Gulfstream only); scoped; displayed once; revocable.
- Audit-log viewer per user: who signed in from where, when, what reef they touched.

### E — Marketing, SEO & Social

- **SEO core**:
  - Astro static generation with `<meta>` tags for every page; canonical URLs.
  - Open Graph + Twitter Card images auto-generated per page (dynamic SVG → PNG at build time).
  - `sitemap.xml` + `robots.txt` auto-generated; submitted to Google Search Console + Bing Webmaster.
  - Structured data: `Organization`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList` JSON-LD.
  - **Performance targets (Lighthouse mobile, p75 real-user)**: LCP < 1.8s, CLS < 0.05, INP < 200ms, TBT < 150ms. Must hit 95+ Performance, 100 SEO, 100 Accessibility, 100 Best Practices.
  - Critical CSS inlined; fonts self-hosted via `@fontsource`; `font-display: swap`.
  - Images: AVIF + WebP with `<picture>`, responsive `srcset`.
- **Content pages at launch**: `/`, `/pricing`, `/security`, `/security/<engine>` (×3), `/about`, `/docs`, `/changelog`, `/blog` (3 seed posts).
- **Social integration**:
  - Share-a-Dib: public, read-only Dib pages at `databreef.io/dib/<public-slug>` with Open Graph preview.
  - "Share to LinkedIn / X / Hacker News" buttons on published Dibs.
  - Social profiles claimed and linked in footer: X, LinkedIn, GitHub, YouTube, RSS.
  - Product Hunt launch assets prepared (gallery, tagline variants, maker comment draft).
- **Analytics**: Plausible (self-hosted) — no cookies, no banner. Goal events for signup, upgrade, reef anchored.

### F — Reliability, Security & Compliance

- **Secrets**: Vercel env vars + Doppler sync; `.env.example` kept in repo; nothing checked in.
- **CSP**: strict, with nonces on inline scripts (Next.js middleware).
- **Other headers**: HSTS (preload), Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options DENY.
- **Dependency hygiene**: `pnpm audit` + Dependabot weekly; Renovate for non-sec updates.
- **SAST/DAST**: Semgrep in CI; OWASP ZAP baseline scan weekly against staging.
- **Penetration test**: scoped external pen-test (CureSec or similar) **one week before launch** — fixes gated to launch.
- **Secret-scanning**: GitHub secret scanning + pre-commit hook (`gitleaks`).
- **Compliance**:
  - **Privacy**: GDPR + CCPA ready — data map, DPA template published, DPO contact in privacy policy, right-to-erasure wired to account deletion flow.
  - **Cookies**: only essential cookies; no banner needed with Plausible.
  - **Legal pages**: Terms of Service, Privacy Policy, Acceptable Use, Subprocessor List, DPA (PDF).
  - **Trust page**: `/security` lists encryption, SOC 2 roadmap ("Type I targeted Q3 2026"), incident response commitment (notify within 72h).
- **Backups**: Supabase PITR enabled (7-day window); nightly logical backup exported to S3 with 90-day retention, cross-region replication. Quarterly restore drill.
- **Disaster recovery**: RTO 4h, RPO 1h documented in `docs/runbooks/dr.md`.

### G — Observability & Operations

- **Errors**: Sentry (Next.js + Astro). Source maps uploaded in CI. Alerts: new issue, issue frequency > 10/min, regression.
- **Logs**: Vercel Log Drains → Axiom (structured JSON). 30-day retention minimum.
- **Metrics**: Vercel Analytics (Web Vitals) + custom PostHog funnels for onboarding.
- **APM**: OpenTelemetry traces from Next.js → Axiom.
- **Uptime**: Better Stack pinging `/api/health`, `/api/health/deep` (DB + Stripe reachability) every minute from 3 regions.
- **Status page**: `status.databreef.io` (Better Stack). Public incident history.
- **On-call**: Better Stack on-call (Darin primary; secondary TBD). Runbook index at `docs/runbooks/`.
- **Alerting**: PagerDuty-style escalation; Slack `#alerts` mirror; phone-call for sev-1.
- **Incident response**: template in `docs/runbooks/incident-template.md`; public post-mortems within 5 business days for sev-1/2.

### H — Quality, Testing & Release Engineering

- **Unit tests**: Vitest; 70%+ coverage on `apps/app/src/lib/` (security-critical code 95%+).
- **Integration tests**: Each adapter hits a real disposable DB via Testcontainers.
- **E2E**: Playwright covering sign-up → anchor reef → surface Dib → upgrade → cancel.
- **Visual regression**: Playwright + percy.io on marketing + app core routes.
- **Accessibility**: axe-core in Playwright; target WCAG 2.1 AA; manual NVDA + VoiceOver pass in Sprint 4.
- **Load testing**: k6 scenario — 500 concurrent introspection jobs, p95 < 2s for catalog queries.
- **CI**: GitHub Actions — lint, typecheck, unit, integration (matrix across engines), build, Lighthouse CI, Semgrep. Required to merge.
- **Feature flags**: LaunchDarkly free tier or a lightweight `flags` table; used to gate MS SQL preview and the public launch itself.
- **Release process**: trunk-based; preview URL per PR; staging = `main`; production = tagged release; rollback plan documented.

---

## 5. Week-by-Week Plan

### Sprint 1 — Foundation (Apr 20 – Apr 26)

Must land:
- Auth.js v5 fully wired, email+password + Google + GitHub working in staging.
- Supabase project provisioned (prod + staging) with PITR, RLS policies authored and tested.
- Drizzle schema v1 migrated: `users`, `accounts`, `sessions`, `sources`, `dibs`, `audit_events`, `stripe_webhook_events`, `plan_features`.
- Connection-string envelope encryption working; rotation runbook drafted.
- Sentry + Axiom + Better Stack wired from day one — no "we'll add it later".
- Legal pages: first draft of ToS, Privacy, AUP with counsel review scheduled.

### Sprint 2 — Breadth (Apr 27 – May 3)

Must land:
- MySQL adapter in production adapter suite passing conformance tests.
- MS SQL adapter in staging behind `mssql_preview` flag.
- Introspection engine strategy interface frozen (no breaking changes after this sprint).
- Audit-log viewer UI shipped at `/settings/audit`.
- Pen-test scope agreed with vendor; kickoff scheduled for Sprint 4 week.
- SEO skeleton: sitemap, robots, OG image generator, JSON-LD on `/` and `/pricing`.

### Sprint 3 — Commerce (May 4 – May 10)

Must land:
- Stripe live-mode tested end-to-end: signup → trial (14 days) → first charge → upgrade → downgrade → cancel → refund.
- Webhooks with idempotency + retry replay; failed-webhook alerting.
- Tax + VAT handling verified with test accounts in US, UK, DE, CA.
- Plan gating middleware live; every paid feature proven gated.
- Account management (`/settings/*`) feature-complete.
- Team seats + invites (paid plans).
- Accessibility pass #1 (axe clean in CI).

### Sprint 4 — Surface (May 11 – May 17)

Must land:
- Pen-test report received; P0/P1 findings fixed; P2 logged with owner + date.
- Lighthouse CI budgets green on all marketing + app routes.
- Status page live and publicly linked; first fire drill completed.
- Final DPA + Subprocessor list published.
- Product Hunt + HN launch assets finalized, scheduled.
- Customer support channel live: `support@databreef.io` → Plain or Front; 24h first-response SLA for paid.
- Onboarding flow polished: 3-step "Anchor your first reef" tour.
- **Go / No-Go review** on May 17 against §11 checklist. Single decision: launch or slip.

---

## 6. Non-Negotiables (Won't-Launch-Without)

These are hard gates. If any is red on May 17, launch slips.

- Every Postgres adapter passes the read-only conformance suite.
- Stripe live-mode has processed a real $1 test charge + full refund from Darin's own card.
- Sentry is catching errors in production; Better Stack has paged once during a drill.
- A full backup has been restored to a clean Supabase project successfully.
- Pen-test P0 + P1 issues all closed; report attached to launch ticket.
- Privacy Policy + ToS + DPA + AUP + Subprocessor List are live and counsel-reviewed.
- MFA works for at least one paid user end-to-end (Darin's own account).
- Account deletion wipes data in Supabase, Stripe (via customer deletion), Sentry, PostHog, Axiom (within TTL).
- Uptime monitor has run 7 consecutive days with ≥ 99.9% green.
- Lighthouse CI has been green on last 10 commits to `main`.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stripe live-mode review delays | Med | High | Submit business details in Sprint 1, not Sprint 3 |
| Pen-test finds Sev-1 | Med | High | Reserve 3 days of Sprint 4 explicitly for fixes; pre-book vendor |
| MS SQL adapter slips | High | Low | Launch as preview — not launch-blocking |
| Supabase outage on launch day | Low | High | Status-page copy pre-written; support autoresponder primed |
| SEO pages thin / duplicative | Med | Med | Editorial pass in Sprint 4; 3 seed blog posts hand-written |
| Solo-founder bus factor | — | High | Doppler shares with co-admin; runbooks complete; on-call secondary identified |

---

## 8. Post-Launch (v1.1 preview — out of scope for this roadmap)

Deliberately deferred so we ship on time:

- Snowflake, Oracle, MongoDB adapters.
- SSO/SAML (Gulfstream tier).
- SOC 2 Type I evidence collection.
- AI-driven Dib generation refinements (the current Dib pipeline ships with a conservative rules-based generator; LLM-assisted narrative copy lands in v1.1).
- Public API + webhooks for customers.
- Self-hosted Docker image GA (currently ships "preview, unsupported").
- Mobile-optimized Dib reader app (PWA).

---

## 9. Dependencies & External Bookings

| Item | When | Owner | Status |
|---|---|---|---|
| Stripe account verification | Apr 20 | Darin | 📋 |
| Pen-test vendor contract | Apr 24 | Darin | 📋 |
| Counsel review (legal pages) | May 4 (draft) → May 11 (final) | Counsel | 📋 |
| Domain email (`support@`, `security@`, `privacy@`, `dpo@`) | Apr 20 | Darin | 📋 |
| SSL / HSTS preload submission | May 14 | Darin | 📋 |
| Product Hunt hunter outreach | May 7 | Darin | 📋 |

---

## 10. Metrics for "Did We Launch Well?" (first 30 days post-launch)

- ≥ 99.9% uptime.
- Zero P0 security incidents.
- ≥ 100 signups, ≥ 10 paid conversions.
- ≥ 50 Dibs surfaced.
- p75 LCP < 2.0s on marketing.
- Support first-response < 24h on every paid ticket.
- Churn < 10% in the first month on paid plans.

---

## 11. Pre-Flight Dive Checklist (run May 17)

The launch captain (Darin) reads this aloud. Every line must be ✅ before a Go.

- [ ] All sprint exit criteria met.
- [ ] Pen-test P0 + P1 closed.
- [ ] Legal pages live and linked from footer on both surfaces.
- [ ] Stripe live-mode: real charge + refund executed today.
- [ ] Backups: most recent restore-drill ≤ 14 days old.
- [ ] Monitoring: Sentry, Axiom, Better Stack all green for 72h.
- [ ] On-call schedule published; phone numbers tested.
- [ ] Status page live at `status.databreef.io`.
- [ ] Incident runbook rehearsed at least once.
- [ ] Lighthouse CI green on last 10 commits.
- [ ] `robots.txt` allows indexing; sitemap submitted.
- [ ] Social profiles live and linked.
- [ ] Launch post written and scheduled.
- [ ] `support@databreef.io` auto-responder tested.
- [ ] Post-mortem template filed at `docs/runbooks/incident-template.md`.
- [ ] Data-deletion flow verified end-to-end with a throwaway account.
- [ ] MFA tested on a paid account.

---

## 12. Change Log

- **2026-04-16** — v1.0.0 — Initial roadmap. Supersedes ad-hoc planning. (Darin)
