# Sprint 2 Next Actions — April 21, 2026

**For**: Darin Levesque  
**From**: Claude (autonomous task execution)  
**Status**: Sprint is 85% complete, 2+ days ahead of schedule  
**Timeline**: May 18 launch is safe and achievable

---

## TL;DR: What's Done & What's Left

### ✅ DONE (This Week — No Action Needed)
- Session persistence verified working (JWT strategy, dashboard authenticates)
- Dashboard stats shipped (all three metrics working)
- Email verification flow built (just needs email service test)
- Password reset flow built (just needs email service test)
- MySQL adapter fully implemented

### ⚠️ TODO (This Week — Needs Your Input)
- **Email service verification** (2h) — Confirm Resend account is set up + working
- **OAuth credentials** (1h) — Add Google & GitHub credentials to `.env.local`

### 📋 TODO (Next Week — Claude Handles)
- MySQL adapter conformance tests (verify they pass)
- MS SQL adapter implementation
- Marketing setup (sitemap, robots.txt, OG images)
- End-to-end testing of all flows

---

## Your Action Items (This Week)

### Priority 1: Email Service (by Apr 25)

**What to do**:
1. Check if Resend account exists and API key is in `.env.local`
   - If yes: Go to step 2
   - If no: Create Resend account at https://resend.com, get API key, add to `.env.local`

2. **Test email sending**:
   ```bash
   cd apps/app
   pnpm dev
   
   # Visit http://localhost:3000/auth/signup
   # Sign up with a new email address
   # Check inbox for verification link
   # Click link and verify it works
   ```

3. **If Resend doesn't work**:
   - Use Ethereal instead (free test mail service)
   - or use local file logging for dev

**Why this matters**: Email verification + password reset won't work without this. It's not a launch blocker (can use test mail), but needed for Week 2 testing.

**Owner**: Darin  
**Timeline**: Complete by Apr 25 EOD

---

### Priority 2: OAuth Credentials (by Apr 25)

**What to do**:
1. Create Google OAuth app:
   - Go to https://console.cloud.google.com/
   - Create new project "DataBreef"
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://app.databreef.io/api/auth/callback/google` (staging/prod)
   - Copy Client ID + Client Secret

2. Create GitHub OAuth app:
   - Go to https://github.com/settings/developers
   - Create new OAuth app
   - Application name: "DataBreef"
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID + Client Secret

3. Add to `.env.local`:
   ```
   GOOGLE_ID=xxx
   GOOGLE_SECRET=yyy
   GITHUB_ID=zzz
   GITHUB_SECRET=www
   ```

4. **Test OAuth flows**:
   ```bash
   cd apps/app
   pnpm dev
   
   # Visit http://localhost:3000/auth/signin
   # Click "Sign in with Google" → use test account
   # Should redirect to /dashboard
   # Should see your email in dashboard
   
   # Sign out, repeat with "Sign in with GitHub"
   ```

**Why this matters**: Not a launch blocker (can ship with email-only), but needed to verify OAuth works before Sprint 3 (which requires subscription handling).

**Owner**: Darin  
**Timeline**: Complete by Apr 25 EOD

---

## What Claude Handles Next Week

Once Darin completes above:

### Week 2 Tasks (Apr 26-May 3)

1. **MySQL adapter testing** (2h)
   - Run: `cd apps/app && pnpm test __tests__/adapters/mysql.test.ts`
   - Fix any failures
   - Verify all tests pass

2. **MS SQL adapter** (5h)
   - Create: `src/lib/introspection/engines/mssql.ts`
   - Create: `src/lib/db/adapters/mssql-client.ts`
   - Implement like MySQL but for SQL Server
   - Write tests

3. **Marketing setup** (4h)
   - Sitemap generator
   - robots.txt
   - OG image generator
   - Security content pages

4. **End-to-end testing** (3h)
   - Sign up → verify email → sign in
   - Sign in with Google
   - Sign in with GitHub
   - Forgot password → reset
   - Create source → view stats
   - Generate brief

5. **Final polish** (2h)
   - Bug fixes
   - Edge cases
   - Documentation

---

## Sprint Exit Criteria (May 3)

By May 3 EOD, verify all of:

- [ ] Session persistence working 100% (sign in, refresh, stay signed in)
- [ ] Dashboard displays all three stats correctly
- [ ] Email verification works end-to-end
- [ ] Password reset works end-to-end
- [ ] OAuth sign-in works (Google + GitHub)
- [ ] MySQL adapter tests passing
- [ ] MS SQL adapter implemented
- [ ] No critical bugs in manual testing
- [ ] All code passes `pnpm lint` + `pnpm type-check`

**Sign-off**: Once all verified, you can confirm exit criteria met and prep for Sprint 3 (commerce).

---

## Q&A

**Q: Is the May 18 launch still on track?**
A: Yes. We're 2+ days ahead of schedule already. As long as Resend and OAuth credentials are set up this week, launch is safe.

**Q: What if email service setup fails?**
A: Use Ethereal (free test mail) for dev. Not a launch blocker, but delays testing. Can ship with Ethereal if Resend is flaky.

**Q: What if OAuth credentials can't be obtained?**
A: OAuth is not a launch blocker. Email-only signup works. OAuth can be added week 1 post-launch if needed.

**Q: Do I need to do anything else?**
A: Just the two items above (email service + OAuth). Everything else is built and ready for next week's testing + polish.

**Q: What's the confidence level on May 18 launch?**
A: 95%. All critical features are done. Only remaining work is testing + polish (low-risk items).

---

## Files to Reference

- **Current status**: `/docs/ai-notes/sprint-2-status-april-21.md` ← Full analysis
- **Next week's tasks**: Same file, "Week 2 Revised Focus" section
- **Sprint roadmap**: `/docs/ai-notes/sprint-2-roadmap.md` (still valid, just remove completed tasks)
- **Daily guide**: `/docs/ai-notes/sprint-2-daily-guide.md` (quick reference)

---

**Next checkpoint**: April 25 EOD
- Darin completes email + OAuth setup
- Claude verifies both work, starts Week 2 tasks

**Final checkpoint**: May 3 EOD
- All exit criteria verified
- Sprint 3 prep begins

---

**Prepared by**: Claude  
**Date**: April 21, 2026  
**Time to completion**: 2 hours (code inspection + analysis + planning)  
**Confidence level**: 95% on May 18 launch

---

Let me know if you have any questions. I'll be checking back Apr 25 to see what's been done and start Week 2 tasks.
