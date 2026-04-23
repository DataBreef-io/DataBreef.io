# Sprint 2 Daily Execution Guide

**Quick reference for Apr 19 – May 3, 2026**

---

## TODAY (Friday, Apr 19)

### Priority 1: Session Persistence Test (Do First — 30 min)

```bash
# 1. Start dev server
cd apps/app
pnpm dev

# 2. In browser:
# - Go to http://localhost:3000/auth/signin
# - Sign in with test email + password
# - Does dashboard show "Welcome, [email]" ?

# 3. Refresh dashboard
# - Still authenticated? ✅
# - Shows "Not authenticated"? ❌ BLOCKER
```

**If ✅ working**: Great! Move to dashboard stats (tomorrow).

**If ❌ broken**: 
- This is the CRITICAL PRIORITY for this sprint
- Follow checklist in `SPRINT_2_ROADMAP.md` § "CRITICAL: Session Persistence"
- DM Darin if stuck after 4 hours

---

## Week 1 Checklist (Apr 19-25)

- [ ] **Fri 19**: Session persistence verified (4h)
- [ ] **Mon 22**: Dashboard stats shipped (1h)
- [ ] **Tue 23**: OAuth credentials acquired (Google + GitHub)
- [ ] **Wed 24**: OAuth testing manual (2h)
- [ ] **Thu 25**: Email service setup (Resend account created)
- [ ] **Fri 26**: Email verification flow shipped (3h)

**If behind**: Skip non-critical features (password reset can move to Week 2 or post-launch)

---

## Week 2 Checklist (Apr 26-May 3)

- [ ] **Sat 27**: Password reset flow shipped (4h)
- [ ] **Mon 29-30**: MySQL adapter shipped + tests green (8h)
- [ ] **Wed 1-2**: MS SQL adapter shipped (5h)
- [ ] **Thu 3**: Marketing setup finalized (4h)

**By May 3 EOD**: All exit criteria met (see `SPRINT_2_ROADMAP.md` end)

---

## Daily Standup Template

**Post in `#databreef-updates` at EOD each day:**

```
**[Date] Standup**

✅ Shipped today:
- [Feature or task]

❌ Blocked:
- [Thing, if any]

📌 Priority tomorrow:
- [Next task]

🚨 Risk:
- [If anything threatens May 3 deadline]
```

---

## Key File Locations

| Task | Primary File | Test File |
|------|--------------|-----------|
| Session persistence | `src/lib/auth.ts` + `src/lib/adapters/supabase.ts` | Manual browser test |
| Dashboard stats | `src/app/(app)/dashboard/page.tsx` | Manual dashboard visit |
| OAuth testing | `.env.local` setup | Manual OAuth flow |
| Email verification | `src/app/auth/verify-email/page.tsx` | Real email to inbox |
| Password reset | `src/app/auth/forgot-password/page.tsx` | Real email + token |
| MySQL adapter | `src/lib/introspection/engines/mysql.ts` | `__tests__/adapters/mysql.test.ts` |
| MS SQL adapter | `src/lib/introspection/engines/mssql.ts` | `__tests__/adapters/mssql.test.ts` |

---

## Pre-Commit Checklist (Before `git push`)

- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes (no TypeScript errors)
- [ ] New files under 300 lines
- [ ] Tests written + passing (if applicable)
- [ ] Commit message includes task reference + brief description
- [ ] No `.env.local` or secrets committed

**Good commit message example:**
```
feat: add MySQL adapter with read-only enforcement

- Implements IntrospectionEngine interface
- Enforces SET SESSION TRANSACTION READ ONLY
- Passes conformance test suite
- Closes #42
```

---

## Risk Signals (If You See These, Escalate)

🚩 **"Session persistence is fundamentally broken"**
- Action: Pair session with Darin immediately
- Can't continue without this

🚩 **"MySQL adapter design doesn't fit our architecture"**
- Action: File GitHub issue, discuss design before implementing
- Might need pattern changes

🚩 **"Email service (Resend) isn't sending"**
- Action: Check API key, test account domain, reach out to support
- Fallback: Use Ethereal (test mail service) for dev

🚩 **"We're 3 days behind schedule on May 1"**
- Action: De-scope password reset + drop to post-launch
- Focus MySQL adapter to 100%

---

## Quick Win Ideas (If Ahead of Schedule)

- [ ] Set up Stripe test account (prep for Sprint 3)
- [ ] Draft 3 blog posts (for marketing launch)
- [ ] Write adapter documentation
- [ ] Create security audit checklist
- [ ] Build deployment runbook

---

## Important Dates

- **Apr 25**: Last day to get OAuth credentials working for testing
- **Apr 30**: Last day for MySQL adapter (gives 1 week to Sprint 3)
- **May 3**: **HARD DEADLINE** — All exit criteria must be met
- **May 4**: Sprint 3 starts (Commerce)
- **May 18**: Launch day 🚀

---

## Slack Channels

- **`#databreef-updates`**: Daily standups + blockers
- **`#databreef-alerts`**: Sentry + Axiom + Better Stack alerts
- **`#databreef-shipping`**: Merged PRs + releases

---

## Resources

- Roadmap: `SPRINT_2_ROADMAP.md` (detailed 14-day plan)
- Launch plan: `docs/roadmap-mvp.md` (full 4-sprint vision)
- Design tokens: `docs/design-system.md`
- Architecture: `docs/site-architecture.md`
- Decisions log: `docs/ai-notes/decisions-log.md`

---

## Success Looks Like (May 3)

- ✅ Dashboard shows "Welcome, [email]" when signed in
- ✅ All OAuth flows tested (signed in with Google, GitHub)
- ✅ Email lands in inbox after signup
- ✅ MySQL introspection works end-to-end
- ✅ Zero critical blockers for Sprint 3
- ✅ All tests passing
- ✅ No unfinished work

🎉 **That's sprint victory.**

---

**Start time: Friday, Apr 19 — GO SHIP.**
