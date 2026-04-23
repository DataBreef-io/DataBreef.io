# Sprint 1 Debug: Session Retrieval Issue

## Current State
- ✅ Signup flow works (user created in database)
- ✅ Signin flow completes (redirects to dashboard)
- ✅ Middleware allows access to `/dashboard`
- ❌ Dashboard `auth()` call fails with AdapterError

This suggests the session cookie exists but the session record isn't in the database.

## Step 1: Verify Migration Applied

Open your Supabase console and run this SQL to check if the `sessions` table exists:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these Auth.js tables:
- `accounts`
- `sessions` ← This is critical
- `users`
- `verification_tokens`

If `sessions` table is missing, the migration wasn't applied.

## Step 2: If Migration Failed

Run this in your terminal (from `apps/app/` directory):

```bash
# Verify environment is set
echo "Database URL: $DATABASE_URL"

# Try the migration again with verbose output
pnpm exec drizzle-kit push --verbose
```

If it fails, check:
1. Is `DATABASE_URL` in `.env.local` correct?
2. Can you connect to Supabase? (try: `psql $DATABASE_URL`)
3. Do you have permission to create tables?

## Step 3: Check Session Table Structure

If the table exists, verify it has the right columns:

```sql
\d sessions
```

Should show columns:
- `id` (uuid, primary key)
- `user_id` (uuid, references users)
- `session_token` (varchar, unique)
- `expires` (timestamp)
- `created_at` (timestamp)

## Step 4: Monitor Logs

Restart your dev server:
```bash
pnpm dev
```

Then:
1. Sign in with a test email/password
2. Watch the terminal for logs starting with `[adapter]` and `[auth]`
3. Report what you see here

Expected log sequence:
```
[adapter] Initializing Supabase adapter with URL: ...
[auth] Credentials authorize called with email: test@example.com
[auth] Credentials valid, returning user: <uuid>
[auth] SignIn callback called for user: <uuid>
[adapter] createSession called with: { userId: <uuid>, expires: ... }
[adapter] createSession created: { id: <uuid>, token: ... }
```

## Step 5: Manual Table Creation (Fallback)

If the migration still hasn't applied, copy the SQL from `drizzle/0000_long_wraith.sql` and run it directly in the Supabase console.

## What We're Looking For

The key is whether `createSession` is being called and succeeding. If it's not being called at all, the Supabase adapter might not be properly initialized. If it's throwing an error, we need to see that error message.

---

**Next Steps:**
1. Run the verification SQL above
2. Restart dev server
3. Sign in and capture the logs
4. Share the output here
