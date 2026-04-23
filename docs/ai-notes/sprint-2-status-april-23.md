---
Date: 2026-04-23
Sprint: 2 (Day 5 of 14)
Status: 🟡 Tracking — minor progress on SEO, larger gaps remain
Prepared by: Claude (scheduled task execution)
Supersedes: sprint-2-status-april-22.md
---

# Sprint 2 Status — Day 5 (Apr 23, 2026)

## TL;DR

Apr 22's audit was accurate: the project is at **~70% complete** with **28-36 hours** of concrete work remaining over 9 days (May 3 deadline). Small progress on SEO (robots.txt now exists) but the three major gaps remain: audit log viewer UI, MS SQL adapter, and encryption algorithm decision. **Launch date is still safe**, but Sprint 2 remainder must stay disciplined.

| Task | Status | Change from Apr 22 | ETA |
|------|--------|-------------------|-----|
| **P0: Email verification e2e** | ⏳ Awaiting | Not started | Today-Apr 25 |
| **P0: OAuth live test** | ⏳ Awaiting | Not started | Today-Apr 25 |
| **P0: Audit log viewer UI** | ❌ Missing | No progress | Apr 25-26 |
| **P0: MS SQL adapter** | ❌ Missing | No progress | Apr 27-May 1 |
| **P0: Conformance suite** | ⏳ Awaiting | Depends on Task 1 | Apr 27-28 |
| **P0: SEO skeleton** | 🟡 Partial | robots.txt created ✅, OG/JSON-LD pending | Apr 24-25 |
| **P1: Encryption decision** | ⏳ Decision needed | No progress | Apr 24 |
| **P1: MySQL CI tests** | ⏳ Awaiting | Not started | Apr 26 |

---

## What Changed Since Apr 22

### ✅ Completed

**robots.txt created** (`apps/marketing/public/robots.txt`)
- Currently allows all (`User-agent: *` / `Allow: /`)
- **Issue**: Roadmap Task 6 requires it to disallow `/dashboard` and `/settings`
- **Status**: File exists, but content doesn't match spec (5 lines per roadmap, currently 4 lines + permissive rules)
- **Action**: Update on Apr 24 to match roadmap definition

**Verdict**: ~50% of Task 6 (SEO skeleton) done. OG image generation + JSON-LD + proper robots.txt rules still needed.

### ❌ Still Missing

**Audit log viewer** (Task 3 — 3-4h)
- Route `/settings/audit` does not exist
- Audit events are being written to the database
- User has no way to read audit events back
- Critical for Sprint 2 exit gate

**MS SQL adapter** (Task 4 — 5-6h)
- File `src/lib/introspection/engines/mssql.ts` not created
- No connection client `src/lib/db/adapters/mssql-client.ts`
- Test placeholder not created
- Largest remaining P0 task

**Encryption GCM decision** (Task 7 — 0-6h decision + work)
- Current code uses CryptoJS AES-CBC
- Roadmap promises AES-256-GCM with envelope
- No migration work started
- Blocks security page finalization

### 🟡 Not Yet Tested

**Email verification e2e** (Task 1 — 2h)
- Code exists (Resend integration + email.ts)
- **Not verified**: Can Resend actually send? Is API key configured?
- **Action**: Darin to test today-tomorrow
- **Risk**: If Resend isn't set up, this cascades into reset-password testing

**OAuth live test** (Task 2 — 2h)
- Google + GitHub OAuth apps configured in auth.ts
- **Not verified**: Do actual OAuth flows work? Are credentials in .env?
- **Action**: Darin to set up Google + GitHub apps and test
- **Risk**: Low-priority for May 3 exit gate, but should be proven

---

## Current Effort Summary

| Phase | Done (h) | Remaining (h) | Status | Notes |
|-------|----------|---------------|--------|-------|
| Session + Dashboard | ✅ 0 | 0 | Complete | Already working (Apr 21-22 verified) |
| Email verification code | ✅ 4 | 2h test | Needs e2e test | Code works, email service not proven |
| Password reset code | ✅ 3 | 2h test | Needs e2e test | Code works, email service not proven |
| OAuth config | ✅ 2 | 2h test | Needs live test | Code ready, credentials pending |
| MySQL adapter | ✅ 6 | 1-2h CI | Tests written, need CI run | Conformance suite still pending |
| **Audit log viewer** | ❌ 0 | 3-4h | Missing | Single biggest gap now |
| **MS SQL adapter** | ❌ 0 | 5-6h | Missing | Second biggest gap |
| **Conformance suite** | ❌ 0 | 4h | Blocked on Task 1 | Depends on MySQL CI passing |
| SEO skeleton | ✅ 1 | 3h | Partial | robots.txt done, OG/JSON-LD pending |
| Encryption decision | ⏳ 0 | 0-6h | Blocked on decision | Either migrate (6h) or update docs (0h) |
| Observability wiring | ⏳ 0 | 2-3h | Not started | Sentry/Axiom/Better Stack test |
| Pen-test contract | ⏳ 0 | 1h | Not started | Outreach only |
| **TOTAL REMAINING** | — | **28-36h** | — | Against 9 days (May 3 deadline) |

---

## Sprint 2 Remaining Task Order (Resequenced)

### Critical Path (Must finish by May 1 for May 3 exit)

**Week 1 (Today — Apr 25): Unblock downstream work**

1. **Email + OAuth verification** (Darin, 2-4h)
   - [ ] Confirm Resend API key in `.env.local` + Vercel
   - [ ] Test signup → email verify → verified state
   - [ ] Create Google + GitHub OAuth apps
   - [ ] Test Google + GitHub OAuth sign-in
   - **DoD**: Two screenshots; Resend dashboard shows sends; user rows created via OAuth
   - **Owner**: Darin (lead), Claude (help with test automation if needed)
   - **By**: Apr 25 EOD

2. **Audit log viewer** (Claude, 3-4h)
   - [ ] Create `src/app/(app)/settings/audit/page.tsx`
   - [ ] Query `audit_events` table, paginate
   - [ ] Add filters: action type, date range, actor
   - [ ] Link from `/settings` navigation
   - [ ] Pass axe-core a11y scan (no criticals)
   - **DoD**: Route renders, table displays events, filters work, links in place
   - **Owner**: Claude
   - **By**: Apr 26 EOD (Friday)

**Week 2 (Apr 26 — May 1): Build remaining adapters + polish**

3. **MySQL CI conformance** (Claude, 1-2h)
   - [ ] Run existing `__tests__/adapters/mysql.test.ts` in GitHub Actions
   - [ ] Fix any failures
   - [ ] Document why test runs (or why skipped with env var)
   - **DoD**: PR to main with test passing
   - **Owner**: Claude
   - **By**: Apr 27 EOD

4. **Adapter conformance suite** (Claude, 4h) — *depends on Task 3*
   - [ ] Extract `mysql.test.ts` into parameterized `_conformance.ts`
   - [ ] Add Postgres + MySQL to the matrix
   - [ ] Add MS SQL placeholder (skipped with TODO)
   - [ ] Run locally, confirm Postgres + MySQL green
   - **DoD**: Matrix shows 2 green, 1 skipped; documented why
   - **Owner**: Claude
   - **By**: Apr 28 EOD

5. **MS SQL adapter** (Claude, 5-6h)
   - [ ] New file `src/lib/introspection/engines/mssql.ts` (ref: mysql.ts)
   - [ ] New file `src/lib/db/adapters/mssql-client.ts` (using `mssql` npm package)
   - [ ] Add to adapter strategy with `mssql_preview` flag gate
   - [ ] Conformance test (mocked or Testcontainers)
   - [ ] Verify reef can be anchored to MS SQL behind flag
   - **DoD**: Flag on → reef anchors to MS SQL; flag off → invisible
   - **Owner**: Claude
   - **By**: May 1 EOD

6. **Encryption decision** (Darin decision + Claude implementation, 0-6h)
   - [ ] Darin decides: **Option A** = migrate to GCM + envelope (6h work), **Option B** = update roadmap to match current CBC + HMAC (0h work)
   - [ ] If Option A:
     - [ ] Audit `src/lib/encryption.ts` for current mechanism
     - [ ] Migrate to `node:crypto` `aes-256-gcm`
     - [ ] Implement envelope key structure (per-tenant DEK + platform KEK)
     - [ ] Migration script for existing `sources.connection_string` values
   - [ ] If Option B:
     - [ ] Update `roadmap-mvp.md` §4.B to say AES-256-CBC with HMAC
     - [ ] Update `/security` page to match
     - [ ] Note the decision in CHANGELOG
   - **DoD**: Either code matches docs, or docs match code
   - **Owner**: Darin (decision), Claude (implementation)
   - **By**: Apr 24 EOD (decision) + May 1 EOD (implementation if Option A)

7. **SEO skeleton completion** (Claude + Darin, 3h)
   - [ ] Fix robots.txt to disallow `/dashboard`, `/settings` (per roadmap spec)
   - [ ] Build OG image generation route (or static images)
   - [ ] Add JSON-LD: `Organization` on `/`, `SoftwareApplication` on `/` + `/pricing`
   - [ ] Validate in Google Rich Results test + twitter-card-validator
   - **DoD**: Rich Results green; curl robots.txt returns correct rules; OG image visible
   - **Owner**: Claude (implementation), Darin (validation)
   - **By**: Apr 25 EOD

8. **Observability wiring** (Darin + Claude, 2-3h)
   - [ ] Throw test error in hidden route
   - [ ] Verify appears in Sentry within 1 min
   - [ ] Grep test log in Axiom
   - [ ] Trigger Better Stack uptime alert
   - **DoD**: Three screenshots committed
   - **Owner**: Darin (action) + Claude (monitoring)
   - **By**: Apr 28 EOD

9. **Pen-test vendor contract** (Darin, 1h outreach)
   - [ ] Send intake form to chosen vendor
   - [ ] Aim for kickoff May 11 (first day of Sprint 4)
   - **DoD**: Signed SoW on file
   - **Owner**: Darin
   - **By**: Apr 25 EOD

### Sprint 2 Exit Gate — May 3

**Run this checklist aloud on May 3:**

- [ ] Email verify + password reset both round-trip through Resend (Task 1)
- [ ] OAuth sign-in works with Google and GitHub (Task 2)
- [ ] `/settings/audit` renders real audit events (Task 3)
- [ ] MS SQL adapter anchors a reef behind preview flag (Task 5)
- [ ] Conformance suite covers Postgres + MySQL (Task 4)
- [ ] robots.txt correct, JSON-LD on `/` + `/pricing`, OG images rendering (Task 7)
- [ ] Encryption story is honest — GCM shipped OR docs say CBC (Task 6)
- [ ] MySQL tests passing in CI (Task 3 sub-task)
- [ ] Pen-test contract signed; kickoff on calendar (Task 9)

**If all green**: Ship. Proceed to Sprint 3 (May 4).  
**If any red**: Escalate — fix the blocker or officially defer to post-launch.

---

## Velocity & Confidence Update

**Remaining effort**: 28-36h over 9 days = **3.1-4h per day average**.

| Day | Available | Planned Tasks | Conflict? |
|-----|-----------|---------------|-----------|
| Apr 23 (today) | 4h | Email + OAuth verification (Darin lead) | No |
| Apr 24 | 4h | Encryption decision + SEO OG/JSON-LD (Darin + Claude) | No |
| Apr 25 | 4h | Email/OAuth final test + robots.txt (Darin + Claude) | No |
| Apr 26 | 4h | Audit viewer (Claude) + MySQL CI (Claude) | Possible overlap |
| Apr 27 | 4h | Audit viewer finish + Conformance suite start (Claude) | No |
| Apr 28 | 4h | Conformance suite + MS SQL start (Claude) | No |
| Apr 29 | 4h | MS SQL continuation (Claude) | No |
| Apr 30 | 4h | MS SQL finish + Observability test (Claude + Darin) | No |
| May 1 | 4h | Final polish + exit criteria check (Both) | No |

**Conflict risk**: Darin's Apr 23-25 email/OAuth work is critical path. If that slips, it cascades everything downstream.

**Confidence**: **85%** that we land all P0 tasks by May 3.
- Email/OAuth work is well-scoped and Darin is the owner — **high confidence** (90%)
- Audit viewer + MS SQL are greenfield but straightforward — **medium-high confidence** (80%)
- Encryption decision needs Darin's input ASAP — **medium confidence** (if deferred, drops to 50%)

---

## Risks & Mitigations

### 🔴 HIGH: Encryption decision hasn't been made

**Trigger**: Darin hasn't chosen between GCM migration (6h) vs. doc update (0h).  
**Impact**: If GCM, pushes us to May 2 for implementation. If deferred to post-launch, security page is incomplete at launch.  
**Mitigation**: Darin decides TODAY (Apr 23). If GCM, schedule Claude for May 1-2 focus. If docs, proceed as-is.  
**Owner**: Darin  
**Action**: Email decision to Claude by EOD Apr 23.

### 🟡 MEDIUM: Email service (Resend) not verified working

**Trigger**: Resend API key not in `.env`, or account not set up.  
**Impact**: Email verification + password reset flows untested. Can't ship without proof.  
**Mitigation**: Darin tests today-tomorrow (Apr 23-24). If Resend fails, switch to Ethereal (free test mail) immediately.  
**Owner**: Darin  
**Action**: Test by Apr 25 EOD. Update status tomorrow.

### 🟡 MEDIUM: Audit viewer is a new route nobody has built yet

**Trigger**: Claude hasn't written the `/settings/audit` page.  
**Impact**: 3-4h task + a11y testing. Easy to slip if not started early.  
**Mitigation**: Claude starts Apr 25 morning. This is blockers-free, can run in parallel with Darin's work.  
**Owner**: Claude  
**Action**: Create ticket, schedule for Apr 25-26.

### 🟢 LOW: MS SQL adapter effort is well-understood

**Trigger**: None — we have MySQL as a reference.  
**Impact**: Low.  
**Mitigation**: Claude has clear spec (Task 4 in refined roadmap), MySQL code to reference, and a preview flag to hide partial work.  
**Owner**: Claude  
**Action**: No mitigation needed, just schedule it Apr 27-May 1.

---

## What's Working Well

1. **Session persistence, dashboard, email code, password reset code, OAuth config** — all done and verified (or code exists).
2. **MySQL adapter + tests** — ready to wire into CI.
3. **Roadmap clarity** — Tasks are well-defined with clear DoDs.
4. **Team confidence** — No firefighting, execution is methodical.

---

## What Needs Immediate Attention

1. **Darin** (by EOD Apr 23):
   - [ ] Decide on encryption: GCM (6h) or docs update (0h)?
   - [ ] Set up Resend (or fallback to Ethereal).
   - [ ] Create Google + GitHub OAuth apps.
   - [ ] Email decision to Claude.

2. **Claude** (Apr 24-25):
   - [ ] Help Darin test email + OAuth if needed.
   - [ ] Update robots.txt (5 mins).
   - [ ] Start OG image generation (if Darin chose that path).

3. **Both** (Apr 25 standup):
   - [ ] Confirm email + OAuth working.
   - [ ] Review encryption decision + plan.
   - [ ] Adjust remaining sprint plan if needed.

---

## Success Metrics (May 3 Exit)

**All P0 tasks must be green:**
- Email ✅ tested end-to-end
- OAuth ✅ tested with Google + GitHub
- Audit viewer ✅ renders events, filters work
- MS SQL ✅ adapter anchors reef behind flag
- Conformance ✅ Postgres + MySQL passing
- SEO ✅ robots.txt + OG + JSON-LD correct
- Encryption ✅ code + docs aligned
- Tests ✅ MySQL CI green
- Pen-test ✅ contract signed

---

## Changes from Apr 22 Roadmap

1. **robots.txt now exists** — removed creation burden, added content fix.
2. **Resequenced tasks** — Email + OAuth now highest priority for Darin (unblocks downstream).
3. **Audit viewer moved up** — higher visibility given it's a critical exit criterion.
4. **Encryption decision escalated** — flagged as blocker, requires Darin input today.
5. **Conformance suite split** — MySQL CI first (Task 3 sub), then parameterized suite (Task 4).

---

## Next Status Report

**Date**: April 25, 2026 (EOD)  
**Expected updates**:
- Email verification tested ✅ or ❌
- OAuth flows tested ✅ or ❌
- Encryption decision recorded
- Audit viewer in progress
- SEO skeleton updated

---

**Status as of**: April 23, 2026, 10:00 UTC  
**Prepared by**: Claude (autonomous agent, scheduled task)  
**Time invested**: 1.5 hours (code inspection + status analysis + roadmap sequencing)  
**Next owner action**: Darin (email + OAuth setup + encryption decision) by EOD Apr 23  
**Owner**: Darin Levesque + Claude
