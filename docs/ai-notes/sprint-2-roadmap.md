# Sprint 2 Roadmap — Breadth & Hardening

**Period**: Apr 19 – May 3, 2026 (14 days)  
**Owner**: Darin Levesque + Claude  
**Exit Criterion**: MySQL adapter in production; MS SQL in staging; dashboard stats shipped; OAuth tested  
**Target Launch**: May 18, 2026 (19 days after sprint end)

---

## 🎯 Sprint 2 Goals

By May 3, we will have:
1. **Session persistence verified** (Auth.js v5 session retrieval working end-to-end)
2. **Dashboard stats shipped** (user sees "Connected Reefs", "Dibs Surfaced", "Last Dive")
3. **OAuth providers tested** (Google + GitHub flows verified with live accounts)
4. **Email verification implemented** (users receive verification emails, flow complete)
5. **MySQL adapter live** (introspection engine + conformance tests passing)
6. **MS SQL adapter staged** (preview flag, ready for staging tests)
7. **Pre-launch marketing setup** (sitemap, OG image generator, JSON-LD schema)

---

## 🔴 CRITICAL: Session Persistence Investigation (Apr 19-20)

**Status**: ⚠️ Blocking dashboard stats implementation  
**Effort**: 2-4 hours to diagnose; 2-6 hours to fix  
**Owner**: Claude + Darin (pair on investigation if needed)

### The Issue
- SPRINT_1_COMPLETE says sessions work
- SPRINT_2_TASKS mentions `createSession()` is never called
- User can sign in but dashboard shows "Not authenticated" (Darin believe's this has been fixed, but verification needed)

### Investigation Checklist
- [ ] **Verify actual behavior**: Sign in, refresh `/dashboard`, observe result
  - If "Welcome, [email]!" → ✅ Sessions ARE working, SPRINT_1 notes are correct
  - If "Not authenticated" → ❌ Sessions ARE broken, investigate below
- [ ] **Check browser devtools**:
  - Network tab: Verify `next-auth.session-token` cookie is set after sign-in
  - Application tab: Check cookie exists, inspect `sessionToken` value
- [ ] **Check server logs**:
  - Run `pnpm dev` with `DEBUG=auth:*` and sign in
  - Look for `createSession()` being called in Auth.js logs
- [ ] **Database check**:
  - Query Supabase: `SELECT COUNT(*) FROM sessions WHERE user_id IS NOT NULL;`
  - If 0 rows → Sessions not being created
  - If > 0 rows → Sessions exist but retrieval is broken

### If Sessions Are Broken
1. **Check Auth.js v5 docs** for database sessions with credentials provider
   - Verify `session.strategy` is set correctly
   - Verify adapter is being used (not JWT fallback)
2. **Review `src/lib/auth.ts`**:
   - Ensure `adapter: supabaseAdapter` is set
   - Ensure `session.strategy = "database"`
   - Check if JWT callback is interfering
3. **Add debug logging** to adapter methods:
   - `createSession()`: Log input params and DB result
   - `getSessionAndUser()`: Log token lookup
   - `auth()` call in middleware: Log session retrieval
4. **Test Auth.js sample** project with same config
5. **Reach out to Auth.js maintainers** if bug suspected

### Test Success Criteria
- ✅ Sign in at `/auth/signin` with email + password
- ✅ Redirected to `/dashboard`
- ✅ Dashboard displays user email + auth info
- ✅ Hard refresh `/dashboard` → Still authenticated
- ✅ New session row appears in `sessions` table

**Blocker until resolved**: Cannot proceed with dashboard stats (#2) or measure auth success

---

## 📊 Dashboard Stats (Depends on #1)

**Status**: Blocked by session persistence  
**Effort**: 1 hour (once sessions work)  
**Owner**: Claude  
**Files**: `src/app/(app)/dashboard/page.tsx`

### What to Implement
Display three metrics on the dashboard:

1. **Connected Reefs** — count of user's database sources
   ```sql
   SELECT COUNT(*) FROM sources WHERE user_id = $1 AND deleted_at IS NULL;
   ```

2. **Dibs Surfaced** — count of generated briefs for this user
   ```sql
   SELECT COUNT(*) FROM dibs WHERE user_id = $1 AND deleted_at IS NULL;
   ```

3. **Last Dive** — most recent brief generation timestamp
   ```sql
   SELECT MAX(created_at) FROM dibs WHERE user_id = $1 AND deleted_at IS NULL;
   ```

### Test Success Criteria
- ✅ Queries return correct counts
- ✅ Dashboard displays stats without errors
- ✅ Stats update after creating a source or brief

---

## 🔐 OAuth Testing (Apr 21-22)

**Status**: Not tested  
**Effort**: 2-3 hours  
**Owner**: Darin (credential setup) + Claude (test automation)  
**Providers**: Google OAuth, GitHub OAuth

### Pre-req: Get Credentials
- [ ] **Google Console**: Create OAuth app, get `GOOGLE_ID` + `GOOGLE_SECRET`
  - Authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google`
    - `https://app.databreef.io/api/auth/callback/google` (staging)
    - `https://app.databreef.io/api/auth/callback/google` (prod, when domain ready)
- [ ] **GitHub**: Create OAuth app, get `GITHUB_ID` + `GITHUB_SECRET`
  - Authorization callback URL:
    - `http://localhost:3000/api/auth/callback/github`
    - `https://app.databreef.io/api/auth/callback/github` (staging/prod)
- [ ] Add credentials to `apps/app/.env.local`

### Test Script (Manual)
1. **Google OAuth**:
   - Visit `http://localhost:3000/auth/signin`
   - Click "Sign in with Google"
   - Use test Google account
   - Verify redirected to `/dashboard`
   - Verify new `accounts` table entry for Google provider
2. **GitHub OAuth**:
   - Same flow with GitHub button
   - Verify account linkage if sign-in twice with same user
3. **Account Linking**:
   - Sign up with email + password as user A
   - Sign in with Google as same email address A
   - Verify both `credentials` and `oauth` in `accounts` table for user A

### Test Success Criteria
- ✅ Google flow completes without errors
- ✅ GitHub flow completes without errors
- ✅ User created correctly with OAuth provider linked
- ✅ Account linking works (same user, multiple OAuth providers)

---

## 📧 Email Verification (Apr 23-25)

**Status**: Placeholder flow exists; needs actual email sending  
**Effort**: 3-4 hours (includes email service setup)  
**Owner**: Claude  
**Files**: `/auth/verify-email` page + email service integration

### Setup: Choose Email Service
Recommend **Resend** (simple, Next.js-friendly):
- [ ] Create Resend account: https://resend.com
- [ ] Get API key, add to `.env.local` as `RESEND_API_KEY`
- [ ] Verify sender domain (can use `onboarding@resend.dev` for testing)

### Implementation
1. **After signup**: Call email service to send verification link
   - Token: Generate short-lived (15 min) signed token
   - Link: `https://app.databreef.io/auth/verify-email?token=xxx`
   - Store token in `verification_tokens` table

2. **Verification endpoint** (`/api/auth/verify-email`):
   - Validate token signature
   - Check expiry (15 min)
   - Mark user as verified: `UPDATE users SET email_verified_at = NOW()`
   - Redirect to `/dashboard`

3. **UI**: `/auth/verify-email` page (check + resend buttons)
   - Show "Verification email sent to user@example.com"
   - "Check spam folder?" link
   - "Resend verification email" button (rate-limited: 1 per 60s)

### Test Success Criteria
- ✅ Signup → email sent automatically
- ✅ User receives email with verification link
- ✅ Click link → user marked as verified
- ✅ Dashboard shows verified badge
- ✅ Users cannot anchor reefs until verified (business rule)

---

## 🔑 Password Reset (Apr 26-27)

**Status**: Not implemented  
**Effort**: 3-4 hours (uses same email service as above)  
**Owner**: Claude  
**Files**: `/auth/forgot-password`, `/auth/reset-password`, email service

### Flow
1. **Forgot Password** (`/auth/forgot-password`):
   - User enters email
   - System sends reset link (15-min TTL token)
   - UI shows "Check your email"

2. **Reset Password** (`/auth/reset-password?token=xxx`):
   - Validate token
   - User enters new password (same strength checks as signup)
   - Password updated, token burned
   - Auto sign-in user (optional, safer to sign back in)

3. **Security**:
   - Token single-use
   - 15-minute expiry
   - Rate-limit forgot-password requests (1 per email per 5 min)

### Test Success Criteria
- ✅ Forgot-password email received
- ✅ Token validation works
- ✅ New password set successfully
- ✅ Expired token rejected with friendly error
- ✅ Rate-limiting works

---

## 🗄️ MySQL Adapter (Apr 28-30)

**Status**: Not implemented  
**Effort**: 6-8 hours  
**Owner**: Claude  
**Target**: Production-ready, no flags

### Deliverables
1. **Adapter file**: `src/lib/introspection/engines/mysql.ts`
   - Implements `IntrospectionEngine` interface
   - Enforces read-only: `SET SESSION TRANSACTION READ ONLY;`
   - Catalog queries via `information_schema`
   - Timeout + error handling

2. **Connection layer**: `src/lib/db/adapters/mysql-client.ts`
   - TLS required (`ssl: true`)
   - Connection pooling (mysql2/promise)
   - Statement timeout per query (30s default)

3. **Security manifest**: `docs/adapters/mysql.md`
   - Recommended role creation script
   - Read-only verification commands
   - Common errors + fixes

4. **Conformance tests**: `__tests__/adapters/mysql.test.ts`
   - Connection test
   - Catalog read test
   - Forbidden-statement rejection (INSERT, UPDATE, DELETE)
   - Audit-log emission

5. **UI integration**:
   - Add MySQL option to "Anchor a Source" flow
   - Show MySQL-specific help text

### Test Success Criteria
- ✅ Adapter connects to test MySQL instance
- ✅ Schema introspection succeeds (tables, columns, indexes)
- ✅ Read-only enforced (INSERT/UPDATE/DELETE rejected)
- ✅ Audit logs created
- ✅ Conformance suite green

---

## 🟡 MS SQL Adapter (May 1-2)

**Status**: Not implemented  
**Effort**: 5-6 hours  
**Owner**: Claude  
**Target**: Staging-ready, behind `mssql_preview` flag

### Deliverables
1. **Adapter file**: `src/lib/introspection/engines/mssql.ts`
   - Implements `IntrospectionEngine` interface
   - Enforces read-only: `APPLICATIONINTENT=READONLY` + `SET TRANSACTION READ ONLY;`
   - Catalog queries via `sys.tables`, `sys.columns`, etc.
   - Named instance support

2. **Connection layer**: `src/lib/db/adapters/mssql-client.ts`
   - Encrypted connection required
   - Connection pooling (tedious)
   - Idle-in-transaction timeout

3. **Feature flag**: Mark as preview in UI + docs
   - `/settings/preview-features` toggle (for Darin to enable)
   - "Preview: MS SQL Server" label in source picker
   - Disclaimer: "Not for production use"

4. **Staged conformance tests**: `__tests__/adapters/mssql.test.ts`
   - Run in CI but don't block merge (tagged as `@preview`)

5. **UI**: Add MS SQL option *only if* user has preview flag enabled

### Test Success Criteria
- ✅ Adapter connects to test MS SQL instance
- ✅ Catalog introspection succeeds
- ✅ Read-only enforced
- ✅ Feature flag works (toggle on/off)
- ✅ Staging conformance tests pass

---

## 🎨 Marketing Setup (Ongoing, Apr 19-May 3)

**Status**: Skeleton in place, needs completion  
**Effort**: 4-6 hours spread across sprint  
**Owner**: Darin (content) + Claude (implementation)

### Week 1 (Apr 19-25)
- [ ] Sitemap generator: `apps/marketing/public/sitemap.xml` (auto-generated at build)
- [ ] robots.txt: Allow indexing on marketing, disallow `/app/*`
- [ ] OG image generator: Dynamic SVG → PNG at build time
- [ ] JSON-LD schema: `Organization` + `SoftwareApplication` on `/`

### Week 2 (Apr 26-May 3)
- [ ] Content pages: `/security`, `/security/postgres`, `/security/mysql`, `/security/mssql`
- [ ] Seed blog posts (3): "Why DataBreef?", "How We Secure Your Data", "Our Launch Story"
- [ ] Pricing page (`/pricing`): Display 4 tiers with features matrix
- [ ] About page (`/about`): Team, mission, values

### Test Success Criteria
- ✅ Sitemap includes all pages
- ✅ `robots.txt` correct
- ✅ OG images render correctly on social share
- ✅ JSON-LD validates (schema.org)
- ✅ Lighthouse performance > 90 on marketing routes

---

## 📅 Week-by-Week Breakdown

### Week 1 (Apr 19-25)
| Day | Task | Owner | Effort |
|-----|------|-------|--------|
| Fri 19 | Session investigation | Both | 4h |
| Sat 20 | Session fix (if broken) | Claude | 6h |
| Mon 22 | Dashboard stats | Claude | 1h |
| Tue 23 | OAuth testing setup | Darin | 1h |
| Wed 24 | OAuth testing + docs | Claude | 2h |
| Thu 25 | Email service setup | Darin + Claude | 2h |
| Fri 26 | Email verification flow | Claude | 3h |

### Week 2 (Apr 26-May 3)
| Day | Task | Owner | Effort |
|-----|------|-------|--------|
| Sat 27 | Password reset | Claude | 4h |
| Mon 29 | MySQL adapter prep | Claude | 2h |
| Tue 30 | MySQL adapter impl | Claude | 6h |
| Wed 1  | MySQL conformance | Claude | 2h |
| Thu 2  | MS SQL adapter | Claude | 5h |
| Fri 3  | Marketing + final polish | Both | 4h |

---

## 🎯 Daily Standup Questions

**At end of each day, answer:**
1. What shipped today?
2. What's blocking progress?
3. What's the priority for tomorrow?
4. Does anything threaten the May 3 deadline?

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Session persistence is deeply broken | Medium | High | **Schedule pair session immediately if not working after 4h investigation** |
| Email service setup delays | Low | Medium | Use `@resend.dev` test domain instead of custom domain initially |
| MySQL adapter takes longer than planned | Medium | Medium | Can defer MS SQL to post-launch if needed; MySQL is critical |
| Pen-test vendor unavailable in Sprint 4 | Low | High | Book vendor by May 1 |
| Team unavailable mid-sprint | Low | Medium | Async standup docs in Slack #databreef-updates |

---

## 🚀 Sprint 2 Success Criteria (Exit Checklist)

By May 3 at 23:59 PT:
- [ ] Session persistence verified and working
- [ ] Dashboard stats shipped and tested
- [ ] OAuth (Google + GitHub) tested end-to-end
- [ ] Email verification flow complete (send + verify + UI)
- [ ] Password reset flow complete
- [ ] MySQL adapter live with all conformance tests passing
- [ ] MS SQL adapter staged behind preview flag
- [ ] Marketing setup complete (sitemap, OG images, security pages)
- [ ] All sprint tasks logged in git commits with clear messages
- [ ] Sprint 2 demo notes written to `docs/ai-notes/sprint-2-completion.md`

---

## 📋 Definition of Done (Per Task)

Each task is done when:
1. ✅ Code passes `pnpm lint` + `pnpm type-check`
2. ✅ All files < 300 lines (CLAUDE.md compliance)
3. ✅ Tests written + passing (unit or integration as applicable)
4. ✅ Documented: README or inline comments for complex logic
5. ✅ Tested manually in dev environment
6. ✅ Commit message references task + includes brief description
7. ✅ Logged in daily standup notes

---

## 📚 Files to Create / Modify

**New Files:**
- `src/lib/introspection/engines/mysql.ts`
- `src/lib/db/adapters/mysql-client.ts`
- `src/lib/introspection/engines/mssql.ts`
- `src/lib/db/adapters/mssql-client.ts`
- `docs/adapters/mysql.md`
- `docs/adapters/mssql.md`
- `docs/ai-notes/sprint-2-completion.md`
- `__tests__/adapters/mysql.test.ts`
- `__tests__/adapters/mssql.test.ts`
- `apps/marketing/public/sitemap.xml`
- `apps/marketing/public/robots.txt`

**Modified Files:**
- `src/app/(app)/dashboard/page.tsx` — Add stats
- `src/lib/auth.ts` — Verify session config
- `src/app/auth/verify-email/page.tsx` — Implement actual flow
- `src/app/api/auth/verify-email/route.ts` — Create endpoint
- `src/app/auth/forgot-password/page.tsx` — Implement
- `src/app/api/auth/forgot-password/route.ts` — Create endpoint
- `src/app/auth/reset-password/page.tsx` — Implement
- `src/app/api/auth/reset-password/route.ts` — Create endpoint
- `apps/marketing/src/pages/security.astro` — Add security pages
- `apps/marketing/astro.config.ts` — Add OG image + JSON-LD generators

---

## Next Steps (After Sprint 2)

**Sprint 3 (May 4-10)**: Commerce
- Stripe live-mode setup + testing
- Subscriptions + webhooks
- Plan gating middleware
- Account settings pages

**Sprint 4 (May 11-17)**: Surface
- Pen-test completion
- Lighthouse CI budgets
- Status page
- Final pre-flight checks

**Launch (May 18)**: Public announce + paid acquisition begins

---

## Sign-Off

**Sprint 2 Roadmap locked April 18, 2026.**  
Ready to begin April 19.  
Owner: Darin Levesque

Questions? File in `#databreef-updates` on Slack or tag @claude.
