# Sprint 2 Kickoff — Findings & Priorities

**Date**: April 18, 2026  
**Owner**: Claude (roadmap synthesis) + Darin (execution)  
**Timeline**: Apr 19 – May 3, 2026 (2 weeks to May 3, then 2 weeks to May 18 launch)

---

## 📊 Status Summary

### ✅ What's Working (Sprint 1 Delivered)
- **Auth system**: Email + password registration + login fully functional
- **Password security**: zxcvbn client-side feedback, argon2id hashing, HIBP breach checking
- **OAuth providers**: Google + GitHub configured (not yet tested)
- **Database**: Supabase live with 9 tables, RLS policies, PITR backup enabled
- **Audit logging**: All auth events logged to immutable `audit_events` table
- **Route protection**: Middleware working, authenticated/unauthenticated routes separate
- **Encryption**: Connection strings encrypted with AES-256-GCM envelope encryption
- **Observability**: Sentry, Axiom, Better Stack wired and ready

### ❌ What's Uncertain (Needs Verification)
- **Session persistence**: Conflicting reports in Sprint 1 notes
  - SPRINT_1_COMPLETE says sessions work
  - SPRINT_2_TASKS says `createSession()` not being called
  - **Action**: Test today — sign in, refresh dashboard, see if authenticated

### 🔮 What's Not Built Yet (Sprint 2 Scope)
- Email verification (actual email sending)
- Password reset flow
- Dashboard stats (depends on session persistence)
- OAuth testing with real accounts
- MySQL adapter
- MS SQL adapter
- Marketing pages (sitemap, OG images, security docs)

---

## 🚨 CRITICAL PRIORITY #1: Session Persistence (Do Today)

**Blocker Status**: Potentially blocking dashboard stats, auth verification, and entire Sprint 3  
**Time to resolve**: 2-4 hours to diagnose, 2-6 hours to fix  

### What to Do
1. **Quick test** (5 min):
   - `pnpm dev` from root
   - Go to `http://localhost:3000/auth/signin`
   - Sign in with test email + password
   - Get redirected to `/dashboard`
   - **Does it say "Welcome, [email]" or "Not authenticated"?**

2. **If working** (sessions are fine):
   - Update `SPRINT_2_TASKS.md` to reflect that #1 is done
   - Move straight to #2 (Dashboard stats)
   - No action needed

3. **If broken** (shows "Not authenticated"):
   - Follow the **Investigation Checklist** in `SPRINT_2_ROADMAP.md`
   - Check browser cookies (devtools → Application)
   - Check server logs for Auth.js errors
   - Likely causes: token format mismatch, adapter not being called, or JWT fallback happening
   - If can't resolve in 4h, pair with Darin or reach out to Auth.js maintainers

**Why this matters**: Every dashboard feature, user stats, and the commerce flow (Sprint 3) depend on session persistence working. It's the foundation.

---

## 🎯 Sprint 2 Critical Path (In Order)

### Week 1 (Apr 19-25)
1. ✅ **Session persistence verification** (Fri 19)
   - Time: 4h (investigation + fix if needed)
   - Blocks: Everything else
2. ✅ **Dashboard stats** (Mon 22)
   - Time: 1h
   - Shows user's reefs, dibs count, last dive timestamp
3. ✅ **Email verification flow** (Thu 25)
   - Time: 3h (Resend API integration + email sending)
   - Important: Users can't anchor reefs without verified email
4. ✅ **OAuth testing** (Wed 24)
   - Time: 2h (manual testing with Google + GitHub)
   - Should be quick if config is correct

### Week 2 (Apr 26-May 3)
5. ✅ **Password reset** (Sat 27)
   - Time: 4h
   - Nice-to-have for MVP, but ships better UX
6. ✅ **MySQL adapter** (Mon-Wed, Apr 29-May 1)
   - Time: 8h
   - **CRITICAL**: This is a hard launch requirement
   - MySQL is PostgreSQL's closest competitor; must be production-ready
7. ✅ **MS SQL adapter** (Thu-Fri, May 2-3)
   - Time: 5h
   - Can be "preview" behind a flag (not production-ready)
8. ✅ **Marketing setup** (Spread across both weeks)
   - Time: 6h total
   - Sitemap, robots.txt, OG images, security pages

---

## 📋 What's at Stake if We Slip

| Missing Feature | Impact | Workaround | Sprint 3 Risk |
|---|---|---|---|
| Session persistence | Dashboard unusable | None — hard blocker | Blocks all commerce |
| MySQL adapter | Can't anchor MySQL reefs | Only PostgreSQL | Limits market reach |
| Email verification | Users not verified | Manual verification | Compliance issue |
| Dashboard stats | Missing user onboarding insight | Show placeholder | Reduces engagement |
| OAuth testing | Unknown if Google/GitHub work | Disable OAuth for launch | Lower signup conversion |

---

## 🔑 Key Decisions Made

### 1. Email Service: **Resend** (vs SendGrid, Mailgun)
- **Why**: Simplest, built for Next.js, good DX
- **Cost**: Free tier covers MVP needs
- **Risk**: If Resend outages, have fallback to log emails locally for testing

### 2. MySQL Adapter Priority Over MS SQL
- **Why**: MySQL/MariaDB are more common than MS SQL in SMB market
- **MS SQL as "Preview"**: Can ship behind flag, not production-ready
- **Snowflake/Oracle deferred**: Post-launch (Sprint 5+)

### 3. Weekly Not Daily Standups
- **Format**: Slack #databreef-updates thread (async)
- **Reason**: Allows flexibility for Darin's other responsibilities
- **Escalation**: Real-time pairing if something breaks

---

## 💾 Artifact Updates

### New Roadmap Documents
- **`SPRINT_2_ROADMAP.md`** (just created)
  - 14-day detailed plan with daily tasks
  - Risk register + success criteria
  - Week-by-week breakdown

### Documents to Update After Sprint 2
- `SPRINT_2_TASKS.md` → Archive or update with actuals
- `docs/ai-notes/progress.md` → Update Phase 3 (App) and Phase 4 (Dib Engine) status
- `docs/ai-notes/sprint-2-completion.md` → Write at end of sprint (like Sprint 1)

### Files That Need Creating
- Email verification pages: `src/app/auth/verify-email/page.tsx`
- Password reset pages: `src/app/auth/forgot-password/page.tsx`, `/reset-password/page.tsx`
- Adapter files: MySQL + MS SQL introspection engines
- Test suites: Conformance tests for both adapters
- Marketing pages: Security docs, pricing, blog seeding

---

## 🎯 Success Metrics (May 3 Exit Criteria)

By end of day May 3, can answer "yes" to:
- ✅ Session persistence working 100% of the time?
- ✅ All OAuth flows tested and working?
- ✅ Email verification flow complete (users receive emails)?
- ✅ Password reset functional?
- ✅ MySQL adapter passes conformance suite?
- ✅ MS SQL adapter ready for staging?
- ✅ Marketing pages live (sitemap, robots, OG)?
- ✅ Zero blockers for Sprint 3 (Commerce)?
- ✅ Less than 5 hours of tech debt / unfinished work?

---

## 🚀 Then What? (Sprint 3 Preview)

May 4-10: **Commerce Sprint**
- Stripe live mode setup + real charge testing
- Subscription webhooks + dunning
- Tax + VAT handling (Stripe Tax)
- Plan gating middleware (free vs paid features)
- Account settings: billing, team, API keys

May 11-17: **Surface Sprint**
- Pen-test completion + fixes
- Lighthouse CI green
- Status page + incident runbook
- Launch checklist final signoff

May 18: **LAUNCH DAY** 🚀
- Public announce
- Paid ads launch
- Support inbox opens

---

## 📞 How to Use This Document

### For Darin
1. **Today (Apr 18)**: Read this document + SPRINT_2_ROADMAP.md
2. **Tomorrow (Apr 19)**: Test session persistence, confirm OAuth credentials are ready
3. **Each day**: Check #databreef-updates for progress, flag blockers early
4. **May 1**: Do a mental "go/no-go" for May 18 launch (do we have enough?)

### For Claude (Next Sessions)
1. Check this document + SPRINT_2_ROADMAP.md at start of each session
2. Use the week-by-week breakdown to stay on track
3. Update daily standup notes in Slack (or in a file)
4. At May 3: Write sprint-2-completion.md (like Sprint 1 had)

---

## 📝 Notes

- **No "tech debt" tasks in this sprint**: Everything must ship or be deferred to v1.1
- **File size limit**: Keep all new code files under 300 lines (CLAUDE.md requirement)
- **Testing**: Each adapter needs a real test DB instance (use Testcontainers if available)
- **Git commits**: Reference task + include brief description ("feat: add MySQL adapter with conformance tests")

---

## Questions Before We Start?

If anything seems unclear, off-track, or impossible:
1. File it in `#databreef-updates`
2. We can reshape the roadmap (but not the May 18 deadline)
3. Better to know now than May 15

**Ready to ship Sprint 2. Let's build something great.** 🌊

---

**Roadmap locked by**: Claude (autonomous agent)  
**Approved by**: Pending Darin review  
**Next update**: After session persistence verdict (today)
