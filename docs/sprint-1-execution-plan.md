# Sprint 1 Execution Plan — Foundation (Apr 20–26)

**Owner**: Darin Levesque  
**Sprint**: Apr 20 – Apr 26, 2026 (7 days)  
**Exit Criteria**: A signed-in user can anchor a Postgres reef end-to-end with audit logs visible  
**Demo Note**: Due: Sunday, Apr 26 at 23:59 PT in `docs/ai-notes/progress.md`

---

## Overview

Sprint 1 establishes the security foundation: auth, encrypted secrets, observability, and schema. Work is split into **parallel tracks**:

| Track | Owner | Deliverable | Blocking? |
|-------|-------|-------------|-----------|
| **A. Auth.js v5 + Supabase** | Claude (code) + Darin (infra) | Email+password, Google, GitHub, session storage | YES — blocks everything |
| **B. Drizzle Schema v1** | Claude (code) + Darin (manual migration) | 8 core tables, migrations, RLS policies | YES — blocks data persistence |
| **C. Connection Encryption** | Claude (code) | AES-256-GCM envelope with KEK | YES — blocks reef anchoring |
| **D. Observability** | Claude (code) + Darin (project setup) | Sentry, Axiom, Better Stack integration | NO — wires later, not blocking auth flow |
| **E. Legal + Compliance** | Darin (counsel liaison) | ToS, Privacy, AUP first draft | NO — counsel review in Sprint 2 |

---

## A. Auth.js v5 + Supabase (High Priority — Blocking)

### What We're Building

- **Provider**: Supabase with Auth.js v5 (dual-mode: `AUTH_PROVIDER=supabase` or `oidc`)
- **Methods**: Email + password, Google OAuth, GitHub OAuth (all three live by day one)
- **Security**: argon2id hashing, zxcvbn strength meter, HIBP k-anonymity check, CSRF protection
- **Sessions**: Drizzle-backed session storage (not Supabase's JWT-only)
- **MFA**: TOTP mandatory for paid accounts (scaffolded in Sprint 1, wired in Sprint 3)

### Code Tasks (Claude)

**File Structure**:
```
apps/app/src/lib/auth.ts                      # Auth.js v5 config + adapter logic
apps/app/src/lib/auth/providers.ts            # OAuth provider config (Google, GitHub)
apps/app/src/lib/auth/supabase-adapter.ts     # Custom Supabase session adapter
apps/app/src/lib/auth/password-security.ts    # argon2id, zxcvbn, HIBP checks
apps/app/src/app/auth/*                       # Next.js dynamic routes for Auth.js
apps/app/src/app/auth/signin/page.tsx         # Email+password form
apps/app/src/app/auth/signup/page.tsx         # Signup with strength meter
apps/app/src/app/auth/oauth/google/route.ts   # OAuth callback handler
apps/app/src/app/auth/oauth/github/route.ts   # OAuth callback handler
apps/app/src/app/auth/callback/route.ts       # Post-OAuth redirect
```

**Implementation Steps**:

1. **Auth.js v5 core** (`apps/app/src/lib/auth.ts`)
   - Import `NextAuthConfig` from `next-auth`
   - Register Supabase adapter (custom — see `supabase-adapter.ts` below)
   - Register CredentialsProvider (email+password via argon2id verify)
   - Register Google + GitHub OAuth providers
   - Export: `auth`, `handlers` (for route handlers), `signIn`, `signOut` helpers

2. **Supabase adapter** (`apps/app/src/lib/auth/supabase-adapter.ts`)
   - Implement `Adapter` interface from next-auth
   - Methods: `createUser`, `getUser`, `getUserByEmail`, `getUserByAccount`, `updateUser`, `deleteUser`, `createSession`, `getSessionAndUser`, `updateSession`, `deleteSession`, `createVerificationToken`, `useVerificationToken`
   - Use Supabase client via `getSupabaseServerClient()` (defined in `supabase-client.ts`)
   - Store sessions in `sessions` table (Drizzle-managed; see §B)
   - Don't use Supabase's JWT — we're using Drizzle sessions

3. **Password security** (`apps/app/src/lib/auth/password-security.ts`)
   - Export `hashPassword(plaintext: string)` → argon2id hash via `argon2`
   - Export `verifyPassword(plaintext: string, hash: string)` → boolean
   - Export `scorePassword(plaintext: string)` → zxcvbn score + feedback
   - Export `checkHIBP(plaintext: string)` → fetch first 5 chars of SHA-1 to HIBP API, check range against response
   - Pattern: fetch `https://api.pwnedpasswords.com/range/{SHA_PREFIX}`, parse response, match suffix

4. **OAuth providers** (`apps/app/src/lib/auth/providers.ts`)
   - Google: Use `id`, `email`, `image` from Google ID token
   - GitHub: Use `id`, `login`, `avatar_url` from GitHub API
   - Extract: `id` (stored as `externalId` + `provider`), `name`, `email`, `image`

5. **Sign-up form** (`apps/app/src/app/auth/signup/page.tsx`)
   - Client component (use `"use client"`)
   - Email input, password input, confirm-password
   - Real-time zxcvbn feedback (show strength bar + tips)
   - On submit: `signIn('credentials', { email, password, redirect: false })` via Auth.js client
   - On error: show message (e.g., "Email already exists")
   - On success: redirect to `/onboarding/verify-email`

6. **Sign-in form** (`apps/app/src/app/auth/signin/page.tsx`)
   - Email + password inputs
   - "Sign up" link
   - "Forgot password" link (defer full flow to Sprint 2; show "Coming soon" or stub)
   - Same `signIn('credentials', ...)` pattern
   - Rate limiting check: fail if too many attempts (middleware layer — see §F, Observability)

7. **OAuth callback routes**
   - Path: `/auth/oauth/[provider]/route.ts` (dynamic route)
   - Delegate to Auth.js handler from `next-auth/core`
   - Catch errors, redirect to `/auth/signin?error=...`

8. **Post-auth redirect** (`/auth/callback/route.ts`)
   - Triggered by Auth.js after session established
   - Redirect to `/onboarding` (new users) or `/dashboard` (existing)

### Manual Tasks (Darin)

**Timeline**: Start immediately (Apr 16–17); finish by Apr 19.

1. **Create Supabase project (prod)**
   - Go to https://app.supabase.com
   - New project: region closest to US (us-east-1), database version 15+
   - Note: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - Enable **Point-in-Time Recovery (PITR)** (7-day window minimum)
   - Save to `~/.env.local` (DO NOT COMMIT)

2. **Create Supabase project (staging)**
   - Same as above; separate project
   - Note keys separately

3. **Google OAuth app** (15 min)
   - Go to https://console.cloud.google.com
   - New project: "DataBreef"
   - Enable: Google+ API
   - Create OAuth 2.0 credential (Web application)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/oauth/google/callback` (dev)
     - `https://staging.databreef.io/auth/oauth/google/callback` (staging)
     - `https://databreef.io/auth/oauth/google/callback` (prod — add after domain live)
   - Copy `GOOGLE_ID`, `GOOGLE_SECRET`

4. **GitHub OAuth app** (15 min)
   - Go to https://github.com/settings/developers (logged in)
   - New OAuth App
   - Authorization callback URL: `http://localhost:3000/auth/oauth/github/callback` (dev)
   - Copy `GITHUB_ID`, `GITHUB_SECRET`
   - Add staging + prod URLs once domains are live

5. **Auth.js secret generation**
   - Run: `openssl rand -base64 32` (or in Node: `crypto.randomBytes(32).toString('base64')`)
   - Set as `NEXTAUTH_SECRET` in `.env.local` (dev) and Vercel env vars (staging/prod)

6. **Verify `.env.example` is updated** (without secrets)
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generated-above>
   GOOGLE_ID=
   GOOGLE_SECRET=
   GITHUB_ID=
   GITHUB_SECRET=
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_KEY=
   ```

**Verification** (by Apr 19):
- [ ] Supabase (prod + staging) accessible; PITR enabled
- [ ] Google OAuth app created; credentials saved
- [ ] GitHub OAuth app created; credentials saved
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `.env.example` updated (no values, only keys)

---

## B. Drizzle Schema v1 (High Priority — Blocking)

### What We're Building

**8 core tables** (all new):
- `users` — auth identity
- `accounts` — OAuth link (Google, GitHub)
- `sessions` — Auth.js-managed session storage
- `sources` — "reefs" (database connections)
- `dibs` — surfaced insights (reports/briefs)
- `audit_events` — immutable audit trail
- `stripe_webhook_events` — idempotency key for Stripe webhooks
- `plan_features` — feature gating matrix (free, tide, current, gulfstream)

### Code Tasks (Claude)

**File Structure**:
```
apps/app/src/db/schema.ts                     # Drizzle schema definitions
apps/app/src/db/migrations/                   # Migration files (auto-gen from schema)
apps/app/src/db/client.ts                     # Postgres.js client + Drizzle instance
```

**Schema** (`apps/app/src/db/schema.ts`):

```typescript
import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, serial, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// USERS
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  emailVerified: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ACCOUNTS (OAuth)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "oauth"
  provider: varchar("provider", { length: 50 }).notNull(), // "google", "github"
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_accounts_user_id").on(table.userId),
  index("idx_accounts_provider").on(table.provider, table.providerAccountId),
]);

// SESSIONS (Auth.js)
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sessions_user_id").on(table.userId),
  index("idx_sessions_token").on(table.sessionToken),
]);

// SOURCES (Reefs)
export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  engine: varchar("engine", { length: 50 }).notNull(), // "postgres", "mysql", "mssql"
  encryptedConnectionString: text("encrypted_connection_string").notNull(),
  encryptionKeyId: varchar("encryption_key_id", { length: 255 }).notNull(), // KMS key reference
  readOnlyVerified: boolean("read_only_verified").default(false),
  lastDiveAt: timestamp("last_dive_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sources_user_id").on(table.userId),
]);

// DIBS (Insights)
export const dibs = pgTable("dibs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  insights: jsonb("insights").notNull(), // Array of metric insights
  isPublic: boolean("is_public").default(false),
  publicSlug: varchar("public_slug", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_dibs_source_id").on(table.sourceId),
  index("idx_dibs_user_id").on(table.userId),
  index("idx_dibs_public_slug").on(table.publicSlug),
]);

// AUDIT_EVENTS (Immutable log)
export const auditEvents = pgTable("audit_events", {
  id: bigserial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(), // "signin", "anchor_reef", "surface_dib", etc.
  details: jsonb("details"), // IP, user-agent, outcome, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_user_id").on(table.userId),
  index("idx_audit_source_id").on(table.sourceId),
  index("idx_audit_created_at").on(table.createdAt),
]);

// STRIPE_WEBHOOK_EVENTS (Idempotency)
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_stripe_event_id").on(table.stripeEventId),
]);

// PLAN_FEATURES (Feature gating)
export const planFeatures = pgTable("plan_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  plan: varchar("plan", { length: 50 }).notNull().unique(), // "free", "tide", "current", "gulfstream"
  maxReefs: integer("max_reefs").notNull(),
  maxDibsPerMonth: integer("max_dibs_per_month").notNull(),
  mfaRequired: boolean("mfa_required").default(false),
  supportLevel: varchar("support_level", { length: 50 }).default("community"), // "community", "email", "priority"
  teamSeats: integer("team_seats").default(0),
  mssqlPreview: boolean("mssql_preview").default(false),
  apiKeysEnabled: boolean("api_keys_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  sources: many(sources),
  dibs: many(dibs),
  auditEvents: many(auditEvents),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  user: one(users, { fields: [sources.userId], references: [users.id] }),
  dibs: many(dibs),
  auditEvents: many(auditEvents),
}));

export const dibsRelations = relations(dibs, ({ one }) => ({
  source: one(sources, { fields: [dibs.sourceId], references: [sources.id] }),
  user: one(users, { fields: [dibs.userId], references: [users.id] }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  user: one(users, { fields: [auditEvents.userId], references: [users.id] }),
  source: one(sources, { fields: [auditEvents.sourceId], references: [sources.id] }),
}));

export const stripeWebhookEventsRelations = relations(stripeWebhookEvents, ({ one }) => ({}));
export const planFeaturesRelations = relations(planFeatures, ({ many }) => ({}));
```

**Database client** (`apps/app/src/db/client.ts`):

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: true, // Always TLS
});

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;
```

**Migration strategy**:
- Run `drizzle-kit generate` to auto-generate migrations from schema
- Manual review of generated SQL (especially foreign keys, indexes, constraints)
- Store migrations in `apps/app/src/db/migrations/`
- Add migration runner to deployment (run before Next.js starts in production)

### Manual Tasks (Darin)

**Timeline**: Start after Supabase provisioning (Apr 18–20).

1. **RLS policies** (Row-Level Security)
   - Supabase dashboard → Authentication → Policies
   - Set RLS to ON for all tables
   - Policies to write (in SQL):
     - `users`: SELECT own row only; INSERT own row only
     - `accounts`: SELECT/DELETE own account (via `user_id`)
     - `sessions`: SELECT own session only
     - `sources`: SELECT/INSERT/DELETE own only
     - `dibs`: SELECT own, or public dibs; INSERT/UPDATE/DELETE own only
     - `audit_events`: SELECT own events only (user_id = auth.uid())
     - Bypass: Service role (for background jobs, migrations)
   
   **Example RLS for `sources` table**:
   ```sql
   -- All users can INSERT their own sources
   CREATE POLICY "insert_own_sources" ON sources
   FOR INSERT TO authenticated
   WITH CHECK (auth.uid()::uuid = user_id);

   -- Users can SELECT their own sources
   CREATE POLICY "select_own_sources" ON sources
   FOR SELECT TO authenticated
   USING (auth.uid()::uuid = user_id);

   -- Users can UPDATE their own sources
   CREATE POLICY "update_own_sources" ON sources
   FOR UPDATE TO authenticated
   USING (auth.uid()::uuid = user_id);

   -- Users can DELETE their own sources
   CREATE POLICY "delete_own_sources" ON sources
   FOR DELETE TO authenticated
   USING (auth.uid()::uuid = user_id);
   ```

2. **Populate `plan_features` table** (5 min manual SQL)
   ```sql
   INSERT INTO plan_features (plan, max_reefs, max_dibs_per_month, mfa_required, support_level, team_seats, mssql_preview, api_keys_enabled)
   VALUES
     ('free', 1, 4, false, 'community', 0, false, false),
     ('tide', 5, 50, true, 'email', 0, false, false),
     ('current', 25, 999, true, 'priority', 1, true, false),
     ('gulfstream', 999, 999, true, 'priority', 10, true, true);
   ```

3. **Enable append-only constraint on `audit_events`**
   - Supabase SQL editor:
   ```sql
   ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "audit_immutable" ON audit_events
   FOR INSERT TO authenticated, service_role
   WITH CHECK (true);
   DENY UPDATE ON audit_events TO authenticated, service_role;
   DENY DELETE ON audit_events TO authenticated, service_role;
   ```

**Verification** (by Apr 20):
- [ ] RLS policies applied to all tables
- [ ] `plan_features` populated with 4 tiers
- [ ] Audit table immutable (INSERT-only)
- [ ] Dev env can connect and query via `db.query.users.findMany()`

---

## C. Connection Encryption (High Priority — Blocking Reef Anchor)

### What We're Building

**Envelope encryption pattern**:
- User's Postgres/MySQL/MSSQL connection string encrypted with per-tenant **data key** (AES-256-GCM)
- Data key encrypted with **platform KEK** (Key Encryption Key)
- KEK stored in Vercel env vars (or AWS KMS for production)
- Encrypted connection stored in `sources.encrypted_connection_string`
- Key ID stored in `sources.encryption_key_id` (for rotation)

**Why**: DataBreef cannot read customer reefs. Encrypted strings prove it.

### Code Tasks (Claude)

**File Structure**:
```
apps/app/src/lib/encryption/envelope.ts       # AES-256-GCM encryption/decryption
apps/app/src/lib/encryption/kek.ts            # KEK management
```

**Envelope encryption** (`apps/app/src/lib/encryption/envelope.ts`):

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;

export interface EncryptedData {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
  keyId: string;
}

/**
 * Encrypt plaintext with a generated data key, wrap key with KEK.
 * @param plaintext - connection string
 * @param kek - platform KEK (base64)
 * @returns { ciphertext, iv, authTag, encryptedDataKey, keyId }
 */
export function encryptWithKEK(
  plaintext: string,
  kek: Buffer
): {
  ciphertext: string;
  iv: string;
  authTag: string;
  encryptedDataKey: string;
  keyId: string;
} {
  // Generate random data key
  const dataKey = crypto.randomBytes(KEY_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Encrypt plaintext with data key
  const cipher = crypto.createCipheriv(ALGORITHM, dataKey, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Encrypt data key with KEK
  const keyCipher = crypto.createCipheriv("aes-256-gcm", kek, iv);
  let encryptedDataKey = keyCipher.update(dataKey, undefined, "hex");
  encryptedDataKey += keyCipher.final("hex");

  const keyId = `kek-v1-${Date.now()}`; // rotation identifier

  return {
    ciphertext: Buffer.from(ciphertext, "hex").toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    encryptedDataKey: Buffer.from(encryptedDataKey, "hex").toString("base64"),
    keyId,
  };
}

/**
 * Decrypt ciphertext with KEK.
 * @param encrypted - { ciphertext, iv, authTag, encryptedDataKey } (all base64)
 * @param kek - platform KEK (base64)
 * @returns plaintext connection string
 */
export function decryptWithKEK(
  encrypted: Omit<EncryptedData, "keyId">,
  kek: Buffer
): string {
  const iv = Buffer.from(encrypted.iv, "base64");
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64");
  const authTag = Buffer.from(encrypted.authTag, "base64");
  const encryptedDataKey = Buffer.from(encrypted.encryptedDataKey, "base64");

  // Decrypt data key with KEK
  const keyDecipher = crypto.createDecipheriv("aes-256-gcm", kek, iv);
  keyDecipher.setAuthTag(authTag);
  let dataKey = keyDecipher.update(encryptedDataKey, "hex", "hex");
  dataKey += keyDecipher.final("hex");

  // Decrypt ciphertext with data key
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(dataKey, "hex"), iv);
  decipher.setAuthTag(authTag);
  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

/**
 * Proof: show that a connection string was encrypted (hash-only, no decryption).
 */
export function hashConnectionString(connectionString: string): string {
  return crypto.createHash("sha256").update(connectionString).digest("hex");
}
```

**KEK management** (`apps/app/src/lib/encryption/kek.ts`):

```typescript
export function getKEK(): Buffer {
  const kekEnv = process.env.ENCRYPTION_KEK;
  if (!kekEnv) {
    throw new Error("ENCRYPTION_KEK not set. Required for envelope encryption.");
  }
  return Buffer.from(kekEnv, "base64");
}

/**
 * For rotation: derive a new KEK, re-encrypt old ciphertexts.
 */
export function rotateKEK(
  oldKek: Buffer,
  newKek: Buffer,
  encryptedDataKey: string
): string {
  // Decrypt data key with old KEK, re-encrypt with new KEK
  // (implementation deferred to Sprint 2 runbook)
  throw new Error("KEK rotation not yet implemented");
}
```

**Usage in reef-anchor flow**:
```typescript
// When user submits connection string
import { encryptWithKEK } from "@/lib/encryption/envelope";
import { getKEK } from "@/lib/encryption/kek";

const kek = getKEK();
const { ciphertext, iv, authTag, encryptedDataKey, keyId } = encryptWithKEK(
  connectionString,
  kek
);

// Store in DB
await db.insert(sources).values({
  userId: user.id,
  name: sourceName,
  engine: "postgres",
  encrypted_connection_string: JSON.stringify({
    ciphertext,
    iv,
    authTag,
    encryptedDataKey,
  }),
  encryption_key_id: keyId,
});
```

### Manual Tasks (Darin)

**Timeline**: Apr 19–20 (short, non-blocking if done after signing key generation).

1. **Generate ENCRYPTION_KEK** (one-time setup)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   - Save output to:
     - `.env.local` (dev, DO NOT COMMIT)
     - Vercel env var `ENCRYPTION_KEK` (staging + prod)
   - Add to `.env.example`:
     ```
     ENCRYPTION_KEK=<generate-via-script-above>
     ```

2. **Add to `.env.example`** (already done above, but verify)

**Verification** (by Apr 20):
- [ ] `ENCRYPTION_KEK` set in `.env.local`
- [ ] Envelope encryption code compiles + unit tests pass

---

## D. Observability (Non-Blocking, Wire in Parallel)

### What We're Building

**Three systems**:
- **Sentry**: Error tracking (Next.js + Astro)
- **Axiom**: Structured JSON logs (30-day retention)
- **Better Stack**: Uptime monitoring + on-call + status page

### Code Tasks (Claude)

**Sentry integration** (`apps/app/src/lib/sentry.ts`):
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return null; // Don't send network errors
      }
    }
    return event;
  },
});

export { Sentry };
```

**Axiom logging** (`apps/app/src/lib/logging.ts`):
```typescript
import axios from "axios";

export async function logEvent(event: {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  userId?: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}) {
  const axiomToken = process.env.AXIOM_TOKEN;
  if (!axiomToken) return; // Skip if not configured

  try {
    await axios.post(
      `https://api.axiom.co/v1/datasets/databreef-logs/ingest`,
      [event],
      {
        headers: {
          Authorization: `Bearer ${axiomToken}`,
          "Content-Type": "application/x-ndjson",
        },
      }
    );
  } catch (err) {
    console.error("Axiom log failed:", err);
  }
}
```

**Better Stack heartbeat** (`apps/app/src/app/api/health/route.ts`):
```typescript
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // Shallow health check
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    return Response.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
```

### Manual Tasks (Darin)

**Timeline**: Apr 19–20 (short setup).

1. **Create Sentry project**
   - Go to https://sentry.io
   - New project: "DataBreef" (Platform: Node.js)
   - Copy DSN → set as `SENTRY_DSN` in `.env.local` and Vercel env vars

2. **Create Axiom account** (free tier)
   - https://axiom.co
   - New dataset: "databreef-logs"
   - Copy API token → set as `AXIOM_TOKEN` in Vercel env vars

3. **Create Better Stack account** (free tier)
   - https://betterstack.com
   - New uptime monitor:
     - URL: `https://databreef.io/api/health`
     - Check interval: 5 minutes
   - New on-call schedule (you as primary)
   - Create status page (name: "DataBreef Status")

**Verification** (by Apr 20):
- [ ] Sentry DSN set
- [ ] Axiom token set
- [ ] Better Stack monitor + on-call created
- [ ] `/api/health` endpoint responds 200 OK

---

## E. Legal + Compliance (Non-Blocking, Counsel Liaison)

### Manual Tasks (Darin)

**Timeline**: Start immediately; counsel review May 4.

1. **Drafting** (You write first pass)
   - Create `/docs/legal/` folder:
     - `terms-of-service.md` — outline:
       - User responsibilities (no illegal use, no malware)
       - DataBreef limitations (read-only, SLA TBD, no warranty)
       - Liability caps (standard: not liable for indirect damages)
       - Termination clause (30 days notice, but reserve right to immediate terminate for abuse)
     - `privacy-policy.md` — outline:
       - Data collected: email, name, OAuth profile, audit logs
       - Data retention: 30 days default, longer for paid (contract)
       - GDPR/CCPA rights: export, delete, portability
       - DPA available on request
     - `acceptable-use.md` — outline:
       - Forbid: illegal activity, malware, DDOS, data exfiltration, automated scraping
       - Forbid: impersonation, harassment, spam
       - Forbid: sublicensing, reverse engineering
     - `subprocessors.md` — list:
       - Supabase (database)
       - Stripe (payments)
       - Sentry (error tracking)
       - Axiom (logging)
       - Better Stack (uptime/status)
       - Google / GitHub (OAuth)
       - Vercel (hosting)
       - Doppler (secrets)

2. **Counsel review** (scheduled May 4)
   - Use your counsel's template or ours
   - Flag: data retention, liability caps, governing law
   - Final publish: May 11–17 (Sprint 4)

3. **DPA template** (deferred to Sprint 2)
   - Standard GDPR DPA (use template from Stripe or Google)

**Verification** (by Apr 26):
- [ ] First draft of ToS, Privacy, AUP in `/docs/legal/`
- [ ] Counsel review scheduled for May 4
- [ ] Subprocessor list up-to-date

---

## F. External Dependencies & Bookings

Act **immediately** (before Apr 20):

| Item | Deadline | Owner | Action |
|------|----------|-------|--------|
| **Stripe account** | Apr 20 | Darin | Go to https://dashboard.stripe.com/register; submit business info (avoid delays in Sprint 3) |
| **Pen-test vendor** | Apr 24 | Darin | Email 2–3 vendors (CureSec, Synack, others); get scope + cost; sign contract |
| **Domain emails** | Apr 20 | Darin | Set up forwarding aliases in your registrar: `support@databreef.io` → your email, etc. |
| **Doppler** | Apr 19 | Darin | Sign up at https://www.doppler.com; create "DataBreef" project; link to GitHub for env sync |
| **Google Search Console** | May 2 | Darin | Verify domain (will do once marketing site is live) |

---

## Work Stream Dependency Graph

```
┌─────────────────────────────────────────────────┐
│ A. Auth.js + Supabase Setup (Darin infra)       │ ← Start Apr 16
└──────────────────┬──────────────────────────────┘
                   │ (by Apr 19)
                   ↓
┌─────────────────────────────────────────────────┐
│ B. Drizzle Schema (Claude code + Darin RLS)     │ ← Start Apr 18
└──────────────────┬──────────────────────────────┘
                   │ (by Apr 20)
                   ↓
┌─────────────────────────────────────────────────┐
│ C. Connection Encryption (Claude code)          │ ← Blocks reef anchor
└──────────────────┬──────────────────────────────┘
                   │ (by Apr 20)
                   ↓
         ┌─────────────────┐
         │ Sprint 1 exit    │
         │ criteria met     │
         │ (Apr 26)         │
         └─────────────────┘

Parallel (non-blocking):
┌──────────────────────────────────────────────┐
│ D. Observability (Claude + Darin setup)      │ ← Wire anytime, not blocking
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ E. Legal (Darin drafting + counsel review)   │ ← Start immediately
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ F. External bookings (Stripe, pen-test, etc) │ ← Act immediately
└──────────────────────────────────────────────┘
```

---

## Sprint 1 Exit Criteria Checklist

By Sunday, Apr 26 at 23:59 PT:

**Auth & Schema**:
- [ ] Auth.js v5 wired; email+password, Google, GitHub all working in staging
- [ ] Sign-in + sign-up flows live and tested end-to-end
- [ ] Drizzle schema migrated; all 8 tables live
- [ ] RLS policies applied and tested

**Security**:
- [ ] Connection string encryption working (envelope + KEK pattern)
- [ ] `.env.example` updated; secrets not in repo
- [ ] `NEXTAUTH_SECRET`, `ENCRYPTION_KEK` generated and in Vercel env vars

**Observability**:
- [ ] Sentry + Axiom + Better Stack wired and receiving events
- [ ] `/api/health` endpoint live and monitored by Better Stack

**Data & Compliance**:
- [ ] `plan_features` table populated
- [ ] Audit log table immutable (INSERT-only, RLS enforced)
- [ ] Legal pages first draft in `/docs/legal/` (ToS, Privacy, AUP)

**Operational**:
- [ ] Stripe account submitted (business info verified)
- [ ] Pen-test vendor contract signed; scope agreed
- [ ] Domain emails configured (`support@`, `security@`, etc.)
- [ ] Doppler + GitHub sync active
- [ ] Counsel review of legal pages **scheduled** for May 4

**Demo Note**:
- [ ] Written and filed at `docs/ai-notes/progress.md` by 23:59 PT on Apr 26

---

## Quick Reference: Darin's Parallel Checklist (Apr 16–26)

### Week of Apr 16–20 (IMMEDIATE)
- [ ] **Apr 16**: Read this plan, skim CLAUDE.md, `roadmap-mvp.md`
- [ ] **Apr 17**: 
  - Start Supabase provisioning (prod + staging)
  - Start Google OAuth app setup
  - Start GitHub OAuth app setup
- [ ] **Apr 18**:
  - Finish Supabase + RLS policies
  - Generate `NEXTAUTH_SECRET`, `ENCRYPTION_KEK`
  - Submit Stripe business info
  - Email pen-test vendor (scope + contract)
- [ ] **Apr 19**:
  - Configure domain emails (`support@`, etc.)
  - Create Sentry + Axiom + Better Stack projects
  - Set up Doppler
  - Start legal drafting (ToS, Privacy, AUP)
- [ ] **Apr 20**:
  - Verify all infra is live (Supabase, OAuth, encryption KEK, monitoring)
  - Share `.env` vars with Claude (securely, not in PRs)
  - Sign pen-test contract

### Week of Apr 21–26 (PARALLEL TESTING)
- [ ] **Apr 21–24**: Test email/password, Google, GitHub sign-in flows as Claude builds
- [ ] **Apr 25**: Run through full user flow: sign up → sign in → verify email → ready for reef anchor (next sprint)
- [ ] **Apr 26**: 
  - Final checklist ✅
  - Sign-off on demo note
  - Sprint 2 prep begins

---

## Notes for Claude (Implementation)

1. **Keep files <300 lines** per CLAUDE.md. Split as you go:
   - `apps/app/src/lib/auth.ts` → core only (import from sub-modules)
   - `apps/app/src/lib/auth/password-security.ts` → separate
   - `apps/app/src/lib/auth/providers.ts` → separate

2. **Drizzle schema**: Don't over-engineer. The 8 tables above are all we need for Sprint 1. Add `team_members`, `invites`, etc. in Sprint 3.

3. **Testing**: Add Vitest unit tests for:
   - `encryptWithKEK` / `decryptWithKEK` round-trip
   - `hashPassword` / `verifyPassword`
   - `scorePassword` (zxcvbn integration)

4. **Security review**: Before finishing Sprint 1, review:
   - No connection strings in logs
   - No plaintext KEK in code
   - CSRF token checked on all mutations
   - Rate limiting on sign-up (see §A, rate limiting)

5. **Token conservation**: I'll build the code; you test manually as it ships. Minimal back-and-forth.

---

## References

- **Auth.js docs**: https://authjs.dev/getting-started
- **Drizzle ORM docs**: https://orm.drizzle.team/docs/overview
- **Supabase RLS docs**: https://supabase.com/docs/guides/auth/row-level-security
- **AES-GCM encryption**: https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_authtag
- **OWASP envelope encryption**: https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
