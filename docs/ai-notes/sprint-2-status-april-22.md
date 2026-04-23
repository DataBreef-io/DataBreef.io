---
Date: 2026-04-22
Sprint: 2 (Day 4 of 14)
Status: 🟢 On track — 2 days ahead
Prepared by: Claude (scheduled task execution)
Supersedes: sprint-2-status-april-21.md
---

# Sprint 2 Status — Day 4 (Apr 22, 2026)

## TL;DR

Yesterday's status was accurate on the major claims (session persistence works, email verification + password reset + MySQL adapter exist). A fresh audit surfaced **three gaps** that need to be folded into remaining Sprint 2 work and an **encryption concern** worth investigating before launch. None of them blocks the May 18 launch, but all of them must be resolved or consciously deferred.

| Area | Apr 21 said | Apr 22 reality | Delta |
|---|---|---|---|
| Session persistence (JWT) | ✅ Working | ✅ Confirmed (auth.ts:30, dashboard/page.tsx:110/116) | — |
| Dashboard stats | ✅ Shipped | ✅ Confirmed (queries `sources` + `dibs` with userId) | — |
| Email verification files | ✅ Complete | ✅ All 4 files present with real content | — |
| Password reset files | ✅ Complete | ✅ All 4 files present, 15-min token TTL | — |
| MySQL adapter | ✅ Implemented | ✅ Engine + client + tests exist | — |
| MS SQL adapter | ❌ Missing | ❌ Confirmed missing | — |
| Marketing (sitemap / robots) | ⚠️ Partial | `sitemap.xml` exists, `robots.txt` does NOT | — |
| Audit log viewer UI (`/settings/audit`) | *not mentioned* | ❌ **Missing** — but it's a Sprint 2 exit criterion in roadmap-mvp.md §5 | **New gap** |
| Encryption mechanism | "AES-256 in place" | `CryptoJS.AES.encrypt` (defaults to **AES-CBC**, NOT **AES-256-GCM** per roadmap §4.B) | **New concern** |
| MFA / TOTP | *not mentioned* | ❌ No code — but roadmap §4.A mandates TOTP for paid plans (Sprint 3) | Deferred OK |
| Test coverage | ✅ "tests written" | 4 test files total across app (target: 70%+ on `src/lib/`) | **New gap** |

## New Findings

### 1. Audit log viewer UI is missing (Sprint 2 exit criterion)

`roadmap-mvp.md` §5 Sprint 2 lists "Audit-log viewer UI shipped at `/settings/audit`" as a must-land item. No such route exists under `src/app/(app)/settings/`. Audit events are being written (encryption.ts + password-reset flow both emit them), but the user cannot read them back.

**Action**: Build the read-side before May 3. Est. 3-4h.

### 2. Connection-string encryption may not match the roadmap's promise

Roadmap §4.B says connection strings use **AES-256-GCM** with envelope encryption (per-tenant data key wrapped by platform KEK). The current `src/lib/encryption.ts` uses `CryptoJS.AES.encrypt(...)` — which defaults to **AES-256-CBC**, not GCM, and there is no visible envelope / KEK structure.

CBC is not broken, but the roadmap explicitly promises GCM (authenticated encryption) and the CLAUDE.md says "Connection strings MUST be encrypted with AES-256 before persistence" — which is technically satisfied, but the launch marketing will claim GCM. This needs to match.

**Action**: Audit encryption before Sprint 4 pen-test. Either (a) migrate to `node:crypto` `createCipheriv('aes-256-gcm', ...)` with envelope key structure, or (b) update the roadmap + security page copy to match what's actually shipping. Est. 4-6h if migrating.

### 3. Test coverage is far below target

Roadmap §4.H: "70%+ coverage on `apps/app/src/lib/`, security-critical code 95%+." Current test files found:
- `__tests__/adapters/mysql.test.ts`
- 3 tests under `src/.../__tests__/` (classifier, insights, synthesis-retry)

That's ~5 tests for a codebase with auth, encryption, introspection engines, and a dashboard. Roadmap also promises a **shared adapter conformance suite** — only MySQL has one.

**Action**: Don't panic-add tests. In Sprint 2 remainder, prioritize (a) run existing MySQL tests green in CI, (b) extract conformance tests into a reusable suite Postgres + MySQL + MS SQL all run. Broader coverage push is a Sprint 4 task.

### 4. `robots.txt` is missing

`apps/marketing/public/sitemap.xml` exists, `apps/marketing/public/robots.txt` does not. Trivial fix (1 file, 5 lines). Include in Week 2 marketing block.

## Today's Take

The project is genuinely in good shape. What changed from yesterday's picture is not that anything is broken — it's that the "we're 85% done" framing underweights three items that were already in the roadmap as Sprint 2 commitments (audit viewer, robots.txt, real conformance suite) plus one that needs a decision (encryption algorithm).

Real completion is probably closer to **70% of Sprint 2**, with 28-36 hours of concrete work remaining vs. 11 days of runway. Still comfortably ahead.

## Handoff to `roadmap-refined-april-22.md`

Concrete task list, owners, and definitions of done are in the refined roadmap doc. Read that next for what to do tomorrow.
