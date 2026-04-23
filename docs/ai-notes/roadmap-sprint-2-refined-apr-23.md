---
Version: 2.1
Created: 2026-04-23
Supersedes: roadmap-refined-april-22.md (v2.0)
Scope: Sprint 2 remainder (Apr 23 — May 3)
Owner: Darin Levesque
---

# Sprint 2 Refined Roadmap — Apr 23, 2026 (Final 11 Days)

This document is **the active Sprint 2 execution plan**. It supersedes v2.0 with minor sequencing changes based on Apr 23 status.

---

## Executive Summary

**Current state**: ~70% complete, 28-36 hours of work remaining over 9 days.

**Critical path**: Darin's email + OAuth verification work (Apr 23-25) unblocks everything downstream.

**Launch confidence**: 85% — all P0 tasks are achievable by May 3 if email/OAuth testing succeeds today.

**No changes to exit criteria** from v2.0, but **resequenced for maximum parallel progress**.

---

## Sequenced Task List (Apr 23 — May 3)

### WEEK 1 (Apr 23-25): Unblock Downstream

#### Task 1a: Email Service Verification — **CRITICAL PATH**
**Owner**: Darin  
**Effort**: 2h  
**When**: Apr 23-24  
**Dependencies**: None

- [ ] Verify Resend account exists and API key is set in `.env.local` on laptop
- [ ] Verify API key is set in Vercel preview environment
- [ ] Sign up with throwaway Gmail from localhost
- [ ] Receive verification email in inbox (check Resend dashboard)
- [ ] Click verify link, reach `/auth/verify-email` success page
- [ ] Confirm `emailVerified` flag set in database
- [ ] Test password reset: request reset, receive email, reset password, log in

**DoD**: Two screenshots (verify success page + Resend dashboard) committed to `docs/ai-notes/evidence/email-verify-apr-23.png`

**If fails**: Switch immediately to Ethereal (free test mail) for dev mode. Update `.env` comments.

**Blocker for**: Tasks 2, 4, 5 (anything requiring email service)

---

#### Task 1b: OAuth Credential Setup & Live Test — **CRITICAL PATH**
**Owner**: Darin  
**Effort**: 2h  
**When**: Apr 23-25  
**Dependencies**: None (parallel with 1a)

- [ ] Create Google OAuth app in Google Cloud Console
  - [ ] Authorized redirect: `http://localhost:3000/api/auth/callback/google` (dev) + `https://databreef.io/api/auth/callback/google` (prod)
  - [ ] Copy `GOOGLE_ID`, `GOOGLE_SECRET`
- [ ] Create GitHub OAuth app in GitHub Settings
  - [ ] Authorization callback: `http://localhost:3000/api/auth/callback/github` (dev) + `https://databreef.io/api/auth/callback/github` (prod)
  - [ ] Copy `GITHUB_ID`, `GITHUB_SECRET`
- [ ] Add all four env vars to `.env.local` on laptop AND Vercel preview
- [ ] Test on localhost:
  - [ ] Click "Sign in with Google" → complete flow → reach dashboard
  - [ ] Check `users` table — new row created with Google ID
  - [ ] Sign out, sign in again → same user row fetched
  - [ ] Click "Sign in with GitHub" → complete flow → reach dashboard
  - [ ] Check `users` table — another new row created with GitHub ID
  - [ ] Test that linking different OAuth providers to same email is prevented (or allowed per CLAUDE.md rules)

**DoD**: Screenshots of successful Google + GitHub sign-in; user rows visible in database; both providers work consistently.

**Blocker for**: Nothing, but high-priority for May 3 exit gate.

---

#### Task 2: SEO Skeleton (robots.txt + OG + JSON-LD)
**Owner**: Claude (implementation), Darin (validation)  
**Effort**: 3h  
**When**: Apr 24-25  
**Dependencies**: None

**robots.txt update** (10 mins):
- [ ] Current file at `apps/marketing/public/robots.txt` allows everything
- [ ] Update to roadmap spec:
  ```
  User-agent: *
  Allow: /
  Disallow: /dashboard
  Disallow: /settings
  Sitemap: https://databreef.io/sitemap.xml
  ```

**OG image generation** (1.5h):
- [ ] Create dynamic OG image route (e.g., `/api/og?title=...&description=...`)
- [ ] OR: Generate static OG images at build time for `/`, `/pricing`, `/security`
- [ ] Wire into `<meta property="og:image">` on key pages
- [ ] Test in twitter-card-validator

**JSON-LD markup** (1h):
- [ ] Add `Organization` schema on `/` (name, logo, URL, contact)
- [ ] Add `SoftwareApplication` schema on `/` + `/pricing` (name, description, offers)
- [ ] Add `FAQPage` schema on `/pricing` (Q&As from pricing FAQ)
- [ ] Validate using Google's Structured Data Testing Tool

**DoD**: 
- `curl databreef.io/robots.txt` returns correct rules (200 status)
- Google Rich Results test passes on `/` + `/pricing`
- twitter-card-validator shows OG image on `/`
- JSON-LD validates (no errors in Google tool)

---

### WEEK 2 (Apr 26 — May 1): Build & Integrate

#### Task 3: Audit Log Viewer UI at `/settings/audit`
**Owner**: Claude  
**Effort**: 3-4h  
**When**: Apr 26-27  
**Dependencies**: None (Session + Auth working)

- [ ] Create route `src/app/(app)/settings/audit/page.tsx`
- [ ] Query `audit_events` table filtered by current user
- [ ] Paginate: 25 rows per page, show page numbers
- [ ] Build table with columns:
  - Timestamp (sortable)
  - Actor (user email)
  - Action (type: 'connection_created', 'password_reset', etc.)
  - Target (reef name / dib name / 'account')
  - Source IP
  - User Agent (abbreviated)
- [ ] Add filters:
  - By action type (dropdown)
  - By date range (date picker)
  - By actor (text input, search by email)
- [ ] Empty state: "No audit events yet" when user has zero events
- [ ] Link to `/settings/audit` from `/settings` navbar

**a11y verification**:
- [ ] Run axe-core in browser DevTools
- [ ] Fix all P0/P1 violations
- [ ] Confirm table headers are marked with `<th>` and role="columnheader"
- [ ] Confirm pagination controls are keyboard-navigable

**DoD**:
- Route renders for authenticated user
- Table displays real audit events
- All filters functional
- Empty state shows correctly
- axe-core shows no critical/serious issues
- Route linked from settings sidebar

---

#### Task 4a: MySQL Adapter CI Integration
**Owner**: Claude  
**Effort**: 1-2h  
**When**: Apr 27  
**Dependencies**: Task 1a (email verified working)

- [ ] Existing test file: `__tests__/adapters/mysql.test.ts`
- [ ] Add GitHub Actions CI step to run: `pnpm test __tests__/adapters/mysql.test.ts`
- [ ] Verify all tests pass locally first
- [ ] Fix any failures (likely database connectivity in CI)
- [ ] Document any CI-specific env vars or skip logic
- [ ] Merge PR to main with tests passing

**DoD**:
- PR to main shows green CI run
- Tests passing in GitHub Actions matrix
- Any skipped tests documented with reason

---

#### Task 4b: Adapter Conformance Suite (Shared)
**Owner**: Claude  
**Effort**: 4h  
**When**: Apr 27-28  
**Dependencies**: Task 4a (MySQL tests green)

- [ ] Create `__tests__/adapters/_conformance.ts` — parameterized test suite
- [ ] Extract test patterns from `mysql.test.ts`
- [ ] Define conformance matrix:
  - Postgres adapter
  - MySQL adapter
  - MS SQL adapter (placeholder, skipped with TODO)
- [ ] Each engine runs:
  - ✅ Connection success + auth
  - ✅ Forbidden statements rejected (UPDATE, DELETE, DROP)
  - ✅ Catalog read (tables, columns, indexes)
  - ✅ Audit log emission (introspection triggers write)
  - ✅ Timeout handling
  - ✅ SSL enforcement
- [ ] Run locally against Testcontainers or mocked adapters
- [ ] Postgres + MySQL must show green; MS SQL shows "TODO: pending adapter"

**DoD**:
- `pnpm test __tests__/adapters/_conformance.ts` shows 2 engines green, 1 skipped
- All test cases parameterized
- Documentation of why MS SQL is skipped

---

#### Task 5: MS SQL Adapter (Behind Preview Flag)
**Owner**: Claude  
**Effort**: 5-6h  
**When**: Apr 27 — May 1  
**Dependencies**: Task 4a (MySQL reference)

**File 1: Connection Client**
- [ ] New file: `src/lib/db/adapters/mssql-client.ts`
- [ ] Use `mssql` npm package (v9+)
- [ ] Required connection options:
  - [ ] `APPLICATIONINTENT=READONLY` (enforce read-only)
  - [ ] TLS required (no plain-text)
  - [ ] Connection timeout: 10s
  - [ ] Query timeout: 30s
- [ ] Implement `connect()` + `disconnect()` + `query(sql, params)`
- [ ] All queries prefixed with `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED`
- [ ] Audit event emission on every introspection query

**File 2: Introspection Engine**
- [ ] New file: `src/lib/introspection/engines/mssql.ts` (ref: `mysql.ts`)
- [ ] Implement:
  - [ ] `listSchemas()` — query `INFORMATION_SCHEMA.SCHEMATA`
  - [ ] `listTables(schema)` — query `INFORMATION_SCHEMA.TABLES`
  - [ ] `listColumns(schema, table)` — query `INFORMATION_SCHEMA.COLUMNS`
  - [ ] `listIndexes(schema, table)` — query `INFORMATION_SCHEMA.STATISTICS`
  - [ ] Error handling for timeouts + access denied
- [ ] Return types match Postgres adapter interface

**File 3: Adapter Strategy Integration**
- [ ] Update `src/lib/introspection/engines/index.ts` to export MS SQL engine
- [ ] Add to adapter strategy factory with `mssql_preview` flag check
- [ ] UI: If user selects MS SQL and flag is off, show "Coming soon" message

**File 4: Tests**
- [ ] New test in conformance suite for MS SQL (parameterized)
- [ ] Can be mocked or real Testcontainers image (acceptable to mock this sprint)
- [ ] Verify connection → forbidden statements → catalog read

**Manual verification**:
- [ ] Anchor a reef to a test MS SQL instance
- [ ] Run a dive (catalog introspection)
- [ ] Verify audit log shows the read operations
- [ ] With flag off: re-anchor form doesn't show MS SQL option

**DoD**:
- Routes don't error with flag on/off
- Reef can be anchored to MS SQL behind flag
- Flag off hides adapter from UI
- Conformance test for MS SQL exists (mocked or Testcontainers)
- No hard-coded connection strings or credentials in code

---

#### Task 6: Encryption Decision & Implementation
**Owner**: Darin (decision), Claude (implementation if needed)  
**Effort**: 0-6h (0h if Option B, 6h if Option A)  
**When**: Decision by EOD Apr 24, implementation by May 1 if Option A  
**Dependencies**: None

**Decision to make (Darin, by EOD Apr 24)**:

Choose ONE:

**Option A: Migrate to AES-256-GCM + Envelope**
- Current: `CryptoJS.AES.encrypt()` → AES-256-CBC with HMAC (implicit)
- Target: `node:crypto` `createCipheriv('aes-256-gcm', ...)` with envelope structure
- Rationale per roadmap: Authenticated encryption, per-tenant DEKs wrapped by platform KEK
- Work:
  - [ ] Audit current `src/lib/encryption.ts`
  - [ ] Create `src/lib/crypto/envelope.ts` with:
    - Platform Key Encryption Key (KEK) from `ENCRYPTION_KEY_PROD`
    - Per-tenant Data Encryption Key (DEK) derivation
    - Envelope format: `[version:1][DEK ciphertext:48][auth tag:16][IV:12][data ciphertext:variable][auth tag:16]`
  - [ ] Migration script to re-encrypt existing `sources.connection_string` values
  - [ ] Version tag so old rows remain readable during migration
  - [ ] Update security docs to match

**Option B: Update Docs to Match Current Code**
- Current code: AES-256-CBC with HMAC (working, strong)
- Update: `roadmap-mvp.md` §4.B + `/security` page to say "AES-256-CBC with HMAC-SHA-256"
- Rationale: Current implementation is secure, GCM was aspirational not required
- Work:
  - [ ] Update roadmap language
  - [ ] Update security page
  - [ ] Add note to CHANGELOG explaining decision

**Recommendation**: Option B (0h work, immediate ship value). Replan GCM for post-launch Sprint 6 if customer feedback demands it.

**DoD**:
- If A: Code + docs aligned on GCM + envelope, migration test successful
- If B: Docs updated, no code changes, decision recorded in CHANGELOG

---

#### Task 7: Observability Wiring Verification
**Owner**: Darin (action), Claude (monitoring)  
**Effort**: 2-3h  
**When**: Apr 28-30  
**Dependencies**: Task 1a (working email service, optional but helpful)

- [ ] **Sentry**: 
  - [ ] Create hidden test route `/api/sentry-test` that throws error
  - [ ] Hit route from localhost
  - [ ] Verify error appears in Sentry dashboard within 1 minute
  - [ ] Check: error message, stack trace, user context correct
  
- [ ] **Axiom**:
  - [ ] Add test log line in a request handler: `logger.info("TEST_AXIOM_Apr23")`
  - [ ] Trigger request
  - [ ] Search Axiom for "TEST_AXIOM_Apr23"
  - [ ] Verify log appears within 1 minute

- [ ] **Better Stack**:
  - [ ] Create status page monitor for `https://databreef.io`
  - [ ] Manually bring down the app (or trigger a 500)
  - [ ] Verify Better Stack detects downtime and alerts
  - [ ] Update status page manually to "Incident" state
  - [ ] Verify public status page shows incident
  - [ ] Clear incident
  - [ ] Verify alerts resolve

**DoD**: Three screenshots committed to `docs/ai-notes/evidence/observability-wired-apr-23.png` showing each tool working.

---

#### Task 8: Pen-Test Vendor Contract
**Owner**: Darin  
**Effort**: 1h outreach  
**When**: Apr 25 EOD  
**Dependencies**: None

- [ ] Send intake form to chosen pen-test vendor
- [ ] Request kickoff date: May 11 (first day of Sprint 4)
- [ ] Include project scope: ~5-day engagement, staging environment, Gulfstream test account
- [ ] Get signed SOW back

**DoD**: Signed SoW file in `docs/` folder; kickoff date on calendar.

---

### Sprint 2 Exit Gate: May 3 (Saturday)

**Standup checklist** (read aloud before shipping):

- [ ] **Task 1a**: Email verification tested end-to-end ✅
- [ ] **Task 1b**: OAuth (Google + GitHub) sign-in tested ✅
- [ ] **Task 2**: robots.txt correct, OG images visible, JSON-LD validates ✅
- [ ] **Task 3**: `/settings/audit` route renders audit events, filters work ✅
- [ ] **Task 4a**: MySQL adapter tests passing in CI ✅
- [ ] **Task 4b**: Conformance suite covers Postgres + MySQL (2 green, 1 skipped) ✅
- [ ] **Task 5**: MS SQL adapter anchors reef behind `mssql_preview` flag ✅
- [ ] **Task 6**: Encryption story finalized (code + docs aligned) ✅
- [ ] **Task 7**: Sentry + Axiom + Better Stack verified working ✅
- [ ] **Task 8**: Pen-test contract signed, kickoff scheduled ✅

**If all ✅**: Declare Sprint 2 complete. Begin Sprint 3 planning (May 4).

**If any ❌**: Escalate. Fix critical blocker or formally defer to post-launch.

---

## Parallel Work Opportunities

| Darin | Claude |
|-------|--------|
| Apr 23-24: Email service setup | Apr 24-25: robots.txt + OG gen |
| Apr 23-25: OAuth apps + test | Apr 26-27: Audit viewer UI |
| Apr 24: Encryption decision | Apr 27: MySQL CI integration |
| Apr 25: Validate SEO | Apr 27-28: Conformance suite |
| Apr 28-30: Observability test | Apr 27-May 1: MS SQL adapter |
| Apr 25: Pen-test outreach | Apr 30: Final polish |

**No sequential bottlenecks** — both can work in parallel from Apr 23 onward.

---

## Risk Adjustments (from v2.0)

| Risk | v2.0 Severity | v2.1 Severity | Change | Mitigation |
|------|---------------|---------------|--------|-----------|
| Email service not set up | 🟡 Medium | 🔴 High | Moved to ASAP | Test by Apr 24 |
| Encryption not decided | 🟡 Medium | 🔴 High | New blocker | Decision by EOD Apr 24 |
| Audit viewer missing | 🟡 Medium | 🟡 Medium | No change | Start Apr 26 |
| MS SQL not started | 🟡 Medium | 🟡 Medium | No change | Clear spec, MySQL ref available |

---

## Success Definition

**May 18 Launch (3 weeks away)** requires all of the above P0 tasks shipped + Sprint 3 complete (commerce + settings + MFA).

**May 3 Exit** is the gate. If any P0 is red, we have 2 weeks to fix it before launch. If all P0 green, we're 70% complete and on track.

---

## Change Log

**v2.1 — April 23, 2026**
- Robots.txt now exists (completion partial, content needs update)
- Resequenced email/OAuth as critical path for Darin (Apr 23-25)
- Escalated encryption decision to blocker (decide by Apr 24)
- Separated MySQL CI (Task 4a) from conformance suite (Task 4b) for clarity
- Added observability wiring verification (Task 7, moved from P1)
- Parallel work matrix added to show no sequential bottlenecks
- Risk table updated to reflect email + encryption as high-severity

**v2.0 — April 22, 2026**
- Initial refined roadmap post-audit
- 11 tasks defined, 28-36h remaining, 9-day runway

---

## Contact & Ownership

**Sprint 2 Lead**: Darin Levesque  
**Execution Partner**: Claude (AI agent)  
**Status frequency**: Daily standups (EOD)  
**Next update**: Apr 25, 2026 (after email/OAuth testing complete)

---

**Prepared by**: Claude (scheduled task)  
**Time**: 2 hours (analysis + sequencing + rewrite)  
**Next review**: Apr 25 EOD (post email/OAuth testing)
