# Sprint 2: Auth Enhancement & Dashboard

**Start After:** Sprint 1 completion (April 17, 2026)  
**Target:** May 1, 2026

---

## Sprint 1 Unresolved Issues (Investigate Early)

### Source Card Stats Not Displaying
**Status:** UNRESOLVED  
**Effort:** Small-Medium (1-2 hours investigation)

**Issue:**
After creating a brief from the sources page, the source card stats (TABLES, BRIEFS, ARCHIVED) do not update. The stats remain at "-" and "0" even though the brief was successfully created in the database.

**Evidence:**
1. ✅ Brief created successfully in database
2. ✅ Brief visible at `/dibs/${id}`
3. ❌ Source card doesn't show updated stats
4. ❌ Issue persists after cache revalidation (`revalidatePath("/sources")`)
5. ❌ Issue persists after changing SQL query to use explicit table/column names

**Investigation done:**
- Added `revalidatePath("/sources")` in `surfaceBriefAction()` → No change
- Changed SQL queries from `${dibs}` template interpolation to explicit quoted identifiers (`"dibs"."source_id"`) → No change
- Verified dibs table schema has proper columns and defaults

**Next steps to try:**
1. **Restart dev server** (most likely culprit - code changes weren't picked up)
2. Check browser network tab to confirm new SQL queries are being sent
3. Check Postgres logs to verify queries are executing
4. Verify the dib record has correct `source_id` matching the source card's source ID
5. Check if there's an issue with Drizzle's SQL template interpolation for subqueries (might need to use `.having()` or alternative query pattern)

**Files involved:**
- `src/app/(app)/sources/page.tsx` → SQL subqueries for activeBriefs, archivedBriefs, latestTableCount
- `src/components/dibs/actions.ts` → surfaceBriefAction()

**Workaround for now:**
Users can manually refresh the page (hard refresh) to see updated stats.

---

## CRITICAL (Blocks MVP Launch)

### 1. Fix Session Persistence (Auth.js v5 Database Sessions)
**Status:** CRITICAL BLOCKER  
**Effort:** High (4-8 hours investigation + implementation)

**Issue:**
Auth.js v5 is **not calling** `adapter.createSession()` when users sign in with credentials. The custom adapter has all required methods, but Auth.js is treating the encrypted JWT as the session token instead of creating a database session.

**Evidence:**
1. ✅ Credentials provider authorize() is called successfully
2. ✅ signIn callback executes (audit logging works)
3. ❌ createSession() is **never called**
4. ❌ getSessionAndUser() is called but with encrypted JWT token
5. ❌ Token lookup fails (session doesn't exist in database)
6. ❌ Dashboard shows "Not authenticated"

**Root cause candidates:**
1. Auth.js v5 has different behavior than v4 for database sessions with credentials provider
2. Missing configuration or callback needed for database sessions to work
3. Bug in how Auth.js v5 handles database strategy with credentials
4. JWT callback was interfering (removed, but didn't fix issue)

**Investigation approach:**
1. Check Auth.js v5 GitHub issues for database sessions + credentials provider
2. Review Auth.js v5 source code for when `adapter.createSession()` is called
3. Try alternative: use JWT strategy with user data encoded in token (simpler, but less secure)
4. Try alternative: custom middleware that manually creates sessions
5. Reach out to Auth.js maintainers if bug is suspected

**Files to investigate:**
- `src/lib/auth.ts` → session config and callbacks
- `src/lib/adapters/custom-postgres.ts` → adapter implementation
- Auth.js v5 documentation and source: https://authjs.dev

**Test:** After fix, sign in and refresh `/dashboard`. Should display authenticated user stats (sources, dibs count).

---

### 2. Implement Dashboard Stats
**Status:** Blocked by #1  
**Effort:** Small (1 hour)

Once session retrieval works:
- Display "Connected Reefs" (count of user's database sources)
- Display "Dibs Surfaced" (count of generated briefs)
- Display "Last Dive" (last brief generation timestamp)

**File:** `src/app/(app)/dashboard/page.tsx`  
**Database queries:** Already written, just needs authenticated session

---

## Medium Priority (OAuth & Email Verification)

### 3. Test OAuth Sign-In Flows
**Status:** Not tested  
**Effort:** Small (1-2 hours)

Providers are configured but untested:
- Google OAuth
- GitHub OAuth

**To test:**
1. Get OAuth credentials from respective consoles
2. Add to `.env.local`: `GOOGLE_ID`, `GOOGLE_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
3. Click OAuth buttons on `/auth/signin`
4. Verify account linkage works

**Files:** `src/lib/auth.ts` (already configured)

---

### 4. Email Verification Flow
**Status:** Not implemented  
**Effort:** Medium (3-4 hours)

Currently: Users are marked as verified immediately on signup.

**To implement:**
1. Create `/auth/verify-email` page
2. Send verification email after signup (uses `verificationTokens` table)
3. Link in email redirects to verify endpoint
4. Mark user as verified in database
5. Prevent login until verified (optional: grace period?)

**Files to create:**
- `src/app/auth/verify-email/page.tsx`
- `src/app/api/auth/verify-email/route.ts`

**Email service:** Need to choose (Resend, SendGrid, Mailgun, etc.)

---

## Lower Priority (Password & Security)

### 5. Password Reset Flow
**Status:** Not implemented  
**Effort:** Medium (3-4 hours)

**Flow:**
1. User goes to `/auth/forgot-password`
2. Enters email
3. System sends reset link (uses `verificationTokens`)
4. Link goes to `/auth/reset-password?token=xxx`
5. User creates new password
6. Token is used and cleared

**Files to create:**
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`

---

### 6. Multi-Factor Authentication (TOTP)
**Status:** Out of scope for MVP  
**Effort:** High (6-8 hours)

**For future:** TOTP-based MFA  
**Can defer:** Post-May 18 MVP launch

---

## Suggested Order of Execution

1. **#1 - Fix Session Retrieval** (Highest priority - blocks everything else)
2. **#2 - Implement Dashboard Stats** (Depends on #1)
3. **#3 - Test OAuth** (Nice-to-have, quick win)
4. **#4 - Email Verification** (Good for MVP launch)
5. **#5 - Password Reset** (Can be post-launch if time-constrained)
6. **#6 - MFA** (Post-launch feature)

---

## Risk Assessment

**Session Retrieval (#1):**
- Likely causes: token format mismatch, expiry logic, timezone issues
- Confidence in fix: High (small number of variables)
- Time estimate: 2-4 hours if root cause is found quickly

**Email Verification (#4):**
- Requires external email service
- Adds new infrastructure dependency
- Can be deferred if time-constrained

**Password Reset (#5):**
- Similar to email verification
- Can be deferred

---

## Notes for Implementation

### Session Debugging Strategy
When tackling #1, add temporary logging to:
1. `createSession()` - log what gets stored
2. `getSessionAndUser()` - log what gets queried
3. `auth()` - log session retrieval result

Then trace the mismatch between creation and retrieval.

### Email Service Selection
For #4 and #5, recommend:
- **Resend** (simple, good for transactional) - Recommended
- **SendGrid** (robust, overkill for MVP)
- **Mailgun** (mid-tier option)

Resend integrates well with Next.js and has good DX.

### Testing
- Test OAuth with test accounts (Google/GitHub provide sandbox environments)
- Email flows need testing with real email addresses (or Ethereal for dev)
- Use a dedicated test user account for MVP testing

---

## Blocked Items

Nothing is blocked outside of Sprint 1 dependencies.

Sprint 1 delivers a working signup/signin flow regardless of the session retrieval issue on subsequent page loads. Users can register and authenticate. The Dashboard display is a Sprint 2 enhancement, not a requirement for user authentication to work.
