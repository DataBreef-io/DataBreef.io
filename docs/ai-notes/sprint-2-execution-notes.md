# Sprint 2 Execution Notes & Refinements
**Updated**: April 19, 2026 (Day 1 of execution)  
**Based on**: Kickoff synthesis + roadmap analysis from Apr 18  
**Owner**: Claude (execution support) + Darin (decisions)

---

## 📋 Roadmap Status

The **Sprint 2 Roadmap** (locked Apr 18) is **solid and well-structured**. These execution notes refine it for real-world shipping.

---

## 🔴 CRITICAL: Session Persistence (Today — Apr 19)

**Status**: Must test TODAY before proceeding with any other work.  
**Blocker**: Every dashboard feature, OAuth verification, and Sprint 3 depends on this.

### Decision Tree
```
Test: Sign in → Refresh /dashboard → Still authenticated?

YES (shows "Welcome, [email]")
  → Sessions are WORKING ✅
  → Log: "Session persistence verified Apr 19"
  → Move straight to Dashboard Stats
  → Update roadmap: "Apr 19 session test PASSED"

NO (shows "Not authenticated")
  → Sessions BROKEN ❌  
  → Log: "Session persistence broken, starting investigation"
  → Follow Sprint 1 Debug checklist
  → If > 4h with no progress: Pair with Darin
  → Risk: Slips all Week 1 work if unfixed
```

**Post-Test Action**: Document result in #databreef-updates with:
- Test result (PASS/FAIL)
- Time spent diagnosing
- Next action
- Any newly discovered blockers

---

## 📊 Task Dependency Map

### Hard Blockers (Must Fix Before Other Tasks)
```
Session Persistence (Apr 19)
  └─→ Dashboard Stats (Apr 22) — Requires working auth()
  └─→ OAuth Testing (Apr 24) — Can't test if sessions broken
  └─→ Email Verification (Apr 25) — User onboarding depends on it
```

### Parallel Work (Can Start Immediately)
```
While diagnosing sessions (Apr 19-20):
  ├─→ Darin: Acquire OAuth credentials (Google + GitHub)
  ├─→ Claude: Set up Resend account + test email sending
  ├─→ Claude: Begin MySQL adapter scaffolding
  └─→ Both: Plan Sprint 3 (Commerce) kickoff
```

### Independent Tracks (No Blockers)
```
Marketing Setup (runs Apr 19-May 3)
  ├─→ Sitemap generator (2h)
  ├─→ Robots.txt + OG images (2h)
  └─→ Security pages scaffolding (2h)
  
Password Reset (Apr 26-27)
  └─→ Can be started anytime after email service is live
```

---

## 🚨 Risk Responses (Updated)

| Risk | Likelihood | Response If Triggered |
|---|---|---|
| **Session persistence broken** | Medium | Pair immediately (Darin + Claude), investigate root cause (JWT vs Database strategy), escalate to Auth.js if needed |
| **OAuth credentials delayed** | Low | Skip OAuth testing for Week 1, but it's not a launch blocker if email verification ships |
| **Resend email service fails** | Low | Use Ethereal (free test mail service) for dev, log emails locally for testing |
| **MySQL adapter takes 10h (not 8h)** | Medium | Cut MS SQL adapter to preview-only (no staging testing), keep MySQL as rock-solid production |
| **Pen-test not booked by May 1** | High | **ACTION: Book vendor by Apr 25 at latest** (can't slip this to avoid Sprint 4 risk) |

---

## ⚡ Daily Execution Checklist

### Every Day (End of Day)
- [ ] Post standup in #databreef-updates with: Shipped, Blocked, Tomorrow's priority, Risks
- [ ] Verify all new code files < 300 lines
- [ ] Run `pnpm lint` + `pnpm type-check` (no errors)
- [ ] Commit with clear message (task reference + description)

### Every Monday (Weekly Sync)
- [ ] Review against roadmap — on track? Behind? Ahead?
- [ ] Identify any new blockers
- [ ] Adjust Friday's priorities if needed

### By May 1 (Mid-Sprint Checkpoint)
- [ ] [ ] Session persistence: VERIFIED ✅
- [ ] [ ] Dashboard stats: SHIPPED ✅
- [ ] [ ] Email verification: COMPLETE ✅
- [ ] [ ] OAuth testing: DONE ✅
- [ ] [ ] MySQL adapter: HALF DONE (backend logic done, tests started)

### By May 3 (Sprint End)
All exit criteria met (see Sprint 2 Roadmap § Success Checklist)

---

## 💡 Descope Criteria (If Behind Schedule)

**By May 1, if we're 2+ days behind, descope in this order:**

1. **KEEP (Non-negotiable)**:
   - Session persistence
   - Dashboard stats
   - Email verification (users can't anchor without it)
   - MySQL adapter (hard launch requirement)

2. **CONSIDER DEFERRING** (post-launch is OK):
   - MS SQL adapter → Move to v1.1
   - Password reset → Users can use forgot-password link (manual flow)
   - Full OAuth testing → Skip testing, just deploy (it usually works)

3. **DEFER ENTIRELY** (marketing can ship minimal):
   - Security pages content → Publish placeholder with roadmap
   - Blog post seeding → Launch with blank blog, publish posts in week 1 post-launch
   - Pricing page design → Use simple static table (no animations)

**Decision**: If we hit this point, call it in #databreef-updates with Darin approval.

---

## 🎯 Definition of "Done" Per Task

Each task must meet ALL of:
1. ✅ Code passes `pnpm lint` + `pnpm type-check`
2. ✅ New files < 300 lines (split if needed)
3. ✅ Tests written + all tests passing
4. ✅ Tested manually in dev environment (not just unit tests)
5. ✅ Commit message references task, includes brief description
6. ✅ Logged in daily standup
7. ✅ No `.env.local` or secrets in commit
8. ✅ For adapters: Conformance tests passing + README documentation

---

## 📝 Daily Standup Template

**Post in #databreef-updates at EOD each day:**

```
**[Date] Standup — Sprint 2 Day X**

✅ **Shipped today:**
- Feature 1
- Feature 2

❌ **Blocked:**
- [Task]: [Reason]
- (If nothing, write "None")

📌 **Priority tomorrow:**
- [Task 1]
- [Task 2]

🚨 **Risk / Concern:**
- [If anything threatens May 3 deadline, call it out here]
- (If nothing critical, write "None")

⏱️ **Time spent:** [X hours on main task]
```

**Example:**
```
**Apr 22 Standup — Day 2**

✅ **Shipped:**
- Session persistence verified ✅
- Dashboard stats component built
- Connected to database queries

❌ **Blocked:**
- None

📌 **Tomorrow:**
- Dashboard stats testing in browser
- Email service setup (Resend account)

🚨 **Risk:**
- None — session fix resolved quickly

⏱️ **Time spent:** 4h
```

---

## 🔄 Decision Log (For This Sprint)

We'll capture key decisions made during execution here. Update daily as major choices arise.

**Format:**
```
### Decision: [Title]
**Date**: [When decided]
**Context**: [Why we faced this choice]
**Options considered**: A, B, C
**Decision**: We chose [A] because [reason]
**Outcome**: [Track this after implementation]
```

---

## 📊 Effort Tracking

Current roadmap estimates total **38 hours** of work across both weeks.

**If tracking actual hours:**
- Session persistence investigation: Est 4h → Actual: ?
- Dashboard stats: Est 1h → Actual: ?
- OAuth testing: Est 2h → Actual: ?
- Email verification: Est 3h → Actual: ?
- Password reset: Est 4h → Actual: ?
- MySQL adapter: Est 8h → Actual: ?
- MS SQL adapter: Est 5h → Actual: ?
- Marketing setup: Est 4h → Actual: ?
- Contingency/polish: ~2h buffer

**Tracking helps us**: Calibrate future sprints, catch early slips, know if we're on track May 1.

---

## 🎯 Success Looks Like (May 3 EOD)

Check all of:
- ✅ Session persistence working 100% of the time (verified with manual test + audit logs)
- ✅ Dashboard shows "Connected Reefs" + "Dibs Surfaced" + "Last Dive"
- ✅ User signs in, refreshes page, still authenticated
- ✅ Email verification sends real emails (users get links in inbox)
- ✅ OAuth flows tested (can sign in with Google and GitHub)
- ✅ Password reset end-to-end (forgot password → email → reset → new password works)
- ✅ MySQL adapter connects + introspects + enforces read-only + tests green
- ✅ MS SQL adapter staged behind feature flag
- ✅ Sitemap auto-generated + robots.txt + OG image generator working
- ✅ Zero critical bugs found in manual testing
- ✅ Less than 5 hours of unfinished work or tech debt

---

## Next Steps (Starting Apr 19)

1. **Right now**: Test session persistence (30 min)
2. **If working**: Move to dashboard stats (tomorrow)
3. **If broken**: Debug following sprint-1-debug.md checklist
4. **Daily**: Post standup, check blockers, keep May 3 in view

**Let's ship.** 🌊

---

**Owner**: Claude (autonomous execution) + Darin (decisions, unblocking)  
**Last updated**: April 19, 2026 — Sprint 2 Day 1  
**Next review**: After session persistence verdict (Apr 19 EOD)
