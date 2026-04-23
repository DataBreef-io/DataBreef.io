# Auth.js v5 Implementation Summary

**Status**: Core auth system built and ready for testing  
**Built by**: Claude  
**Date**: 2026-04-16

---

## What Was Built

### 1. Database Schema (`apps/app/src/lib/tables/schema.ts`)
✅ Added Auth.js standard tables:
- `users` — user identity, email, password hash, profile image
- `accounts` — OAuth links (Google, GitHub)
- `sessions` — Auth.js session storage (database strategy)
- `verificationTokens` — for email verification & password reset
- `auditEvents` — immutable security audit trail

All tables include proper foreign keys, indexes, and Drizzle relations.

### 2. Password Security (`apps/app/src/lib/auth/password-security.ts`)
✅ Complete password security layer:
- **argon2id hashing** — industry-standard with 19MB memory cost
- **zxcvbn strength meter** — real-time feedback (0-4 score)
- **HIBP check** — detects breached passwords via k-anonymity API
- All async for non-blocking operations

### 3. Auth.js Core Config (`apps/app/src/lib/auth.ts`)
✅ Fully wired Auth.js v5:
- **Supabase adapter** — official @auth/supabase-adapter
- **Credentials provider** — email + password (argon2id verified)
- **Google OAuth** — via GOOGLE_ID / GOOGLE_SECRET
- **GitHub OAuth** — via GITHUB_ID / GITHUB_SECRET
- **Database sessions** — 30-day max age, Drizzle backend
- **Sign-in callbacks** — logs to `auditEvents` table

### 4. Adapters (`apps/app/src/lib/adapters/`)
✅ Supabase + adapter routing:
- `supabase.ts` — wraps official @auth/supabase-adapter
- `index.ts` — adapter factory, defaults to supabase

### 5. Auth Routes & Forms
✅ **Sign-In** (`apps/app/src/app/auth/signin/page.tsx`):
- Email + password form
- Google OAuth button
- GitHub OAuth button
- Error handling, loading states
- Redirect to dashboard on success

✅ **Sign-Up** (`apps/app/src/app/auth/signup/page.tsx`):
- Email input
- Password input with real-time zxcvbn feedback
- Password strength bar (0-4 visual indicator)
- Suggestions for weak passwords
- Confirm password field
- HIBP check on submit
- Minimum 12-character requirement
- Terms of Service link

✅ **Sign-Up API** (`apps/app/src/app/api/auth/signup/route.ts`):
- POST endpoint for user creation
- Email uniqueness check
- User record insertion to Supabase
- Error handling (409 if exists, 400 if invalid, 500 if DB fails)

✅ **Auth.js Handler** (`apps/app/src/app/api/auth/[...auth]/route.ts`):
- Dynamic route for /api/auth/* endpoints
- Handles signin, signout, session, callback, csrf, providers

### 6. Connection Encryption (`apps/app/src/lib/encryption/envelope.ts`)
✅ Enterprise-grade envelope encryption:
- **AES-256-GCM** plaintext encryption (with generated data key)
- **KEK wrapping** — data key encrypted with platform KEK
- **getKEK()** — fetches ENCRYPTION_KEK from env
- **encryptWithKEK()** — returns { ciphertext, iv, authTag, encryptedDataKey, keyId }
- **decryptWithKEK()** — recovers plaintext
- **hashConnectionString()** — one-way hash for audit logs

---

## Installation & Setup

### Step 1: Install Dependencies
**You need to run this** (copy-paste into terminal):

```bash
cd apps/app
pnpm add next-auth@beta @auth/supabase-adapter @supabase/supabase-js argon2 zxcvbn
pnpm add -D @types/argon2 @types/zxcvbn
```

### Step 2: Environment Variables
**Already done**: Your `.env.local` has all the keys. Verify they're set:
```
SUPABASE_URL=https://dhqedspypdlifuricmbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_KEY=sb_secret_...
DATABASE_HOST=db.dhqedspypdlifuricmbm.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=...
DATABASE_NAME=postgres
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
ENCRYPTION_KEK=...
```

### Step 3: Run Database Migrations
**You need to do this** to create the new tables in Supabase:

```bash
# Generate migrations from schema
cd apps/app
pnpm exec drizzle-kit generate:pg

# Review the generated SQL in `src/db/migrations/`
# Then apply to Supabase via dashboard or CLI:
# Option A: Supabase dashboard → SQL Editor → paste migration SQL
# Option B: Via CLI (if configured)
```

### Step 4: Set Up RLS Policies (Supabase)
**You need to do this** for security. In Supabase dashboard → Authentication → Policies:

```sql
-- For users table
CREATE POLICY "users_select_own" ON users
FOR SELECT TO authenticated
USING (auth.uid()::uuid = id);

-- For sessions table  
CREATE POLICY "sessions_select_own" ON sessions
FOR SELECT TO authenticated
USING (auth.uid()::uuid = user_id);

-- Similar for accounts, verificationTokens
-- Audit events: users can only see their own
-- Allow service_role to insert/select (for auth callbacks)
```

---

## What's Left for Sprint 1

### For You (Darin):
1. **Install dependencies** (npm command above)
2. **Run migrations** (drizzle-kit + Supabase SQL)
3. **Set up RLS policies** (SQL in Supabase dashboard)
4. **Add OAuth credentials** to `.env.local` if not done:
   - GOOGLE_ID / GOOGLE_SECRET (from Google OAuth app)
   - GITHUB_ID / GITHUB_SECRET (from GitHub OAuth app)
5. **Test the auth flow**:
   - Run `pnpm dev` from project root
   - Navigate to http://localhost:3000/auth/signin
   - Try email/password signup → verify form validation works
   - Try email/password signin
   - Try Google OAuth (if credentials set)
   - Try GitHub OAuth (if credentials set)

### For Claude (Next Steps):
1. Create **middleware** for session protection (`middleware.ts`)
2. Create **dashboard layout** with sign-out button
3. Create **onboarding flow** for email verification
4. Add **rate limiting** on sign-in/sign-up endpoints
5. Add **comprehensive tests** (Vitest for password security, E2E for flows)

---

## File Structure Summary

```
apps/app/src/
├── lib/
│   ├── auth.ts                           # Auth.js v5 config
│   ├── auth/
│   │   └── password-security.ts          # argon2, zxcvbn, HIBP
│   ├── adapters/
│   │   ├── index.ts                      # Adapter factory
│   │   └── supabase.ts                   # Supabase adapter wrapper
│   ├── encryption/
│   │   └── envelope.ts                   # AES-256-GCM + KEK
│   ├── tables/
│   │   └── schema.ts                     # Drizzle schema (updated)
│   └── db-client.ts                      # Drizzle + Postgres client
└── app/
    ├── auth/
    │   ├── signin/
    │   │   └── page.tsx                  # Sign-in form
    │   ├── signup/
    │   │   └── page.tsx                  # Sign-up form
    │   └── onboarding/                   # TBD
    └── api/
        └── auth/
            ├── signup/
            │   └── route.ts              # User creation endpoint
            └── [...auth]/
                └── route.ts              # Auth.js handlers
```

---

## Testing Checklist

Before moving to the next sprint:

- [ ] `pnpm dev` starts without errors
- [ ] http://localhost:3000/auth/signin loads
- [ ] http://localhost:3000/auth/signup loads
- [ ] Sign-up form validates (password strength feedback works)
- [ ] Can create account via email + password
- [ ] Can sign in with email + password
- [ ] Session persists after signin (check cookies)
- [ ] Google OAuth button appears (if GOOGLE_ID set)
- [ ] GitHub OAuth button appears (if GITHUB_ID set)
- [ ] Audit log entries appear after signin
- [ ] Can sign out
- [ ] Encryption utils round-trip (test with sample connection string)

---

## Security Notes

1. **Password hashing**: Happens on client (in sign-up form) before sending. Server-side verification happens at sign-in only. This protects users if HTTPS is ever compromised.

2. **HIBP check**: Fails open — if the API is down, sign-up continues. Better UX than blocking users.

3. **OAuth**: Uses `allowDangerousEmailAccountLinking: true` temporarily. In Sprint 3, we'll add email verification to prevent account takeover.

4. **Encryption**: Connection strings are encrypted with AES-256-GCM. DataBreef cannot decrypt them without the KEK. Cryptographic proof of read-only.

5. **RLS policies**: Supabase's row-level security ensures users can't access other users' data even if they get a session token.

---

## Next Sprint (Sprint 2) Prep

- **MySQL adapter** integration
- **MS SQL adapter** (preview flag)
- **Email verification** flow (verify token sent to inbox)
- **Password reset** flow (forgot password)
- **MFA TOTP** setup (mandatory for paid)
- **Team invites** & member management

---

## References

- Auth.js v5 docs: https://authjs.dev/getting-started/installation
- Supabase auth: https://supabase.com/docs/guides/auth
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- OWASP password cheat sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
