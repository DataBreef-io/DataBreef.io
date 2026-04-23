# DataBreef — Site Architecture
> Version 1.0.0 · Last updated: 2026-04-12

---

## Overview

DataBreef is a **read-only** database intelligence platform. Users connect a PostgreSQL schema via a secure read-only connection string. The platform introspects the schema and generates **Dibs** (Data Intelligence Briefs) — surfacing trends, anomalies, relationships, and health indicators without ever mutating data.

The platform has two distinct surfaces:
1. **Marketing Site** (`apps/marketing/`) — static public site, drives signups
2. **App** (`apps/app/`) — authenticated SaaS dashboard + self-hosted Docker image

---

## Monorepo Structure

```
databreef.io/                      ← pnpm workspace root
├── apps/
│   ├── marketing/                 ← Astro 5 — static marketing site
│   └── app/                       ← Next.js 15 — the actual product
├── packages/
│   ├── tokens/                    ← Shared CSS design tokens
│   └── ui/                        ← Shared React component primitives
├── docker/
│   ├── app.Dockerfile             ← Only apps/app/ is containerized
│   ├── docker-compose.yml         ← Self-hosted reference config
│   └── .dockerignore
├── docs/                          ← Architecture & design docs (this file)
│   ├── design-system.md
│   ├── site-architecture.md
│   └── ai-notes/                  ← Agent knowledge base
└── README.md
```

---

## Technology Stack

### `apps/marketing/` — Marketing Site

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro 5** | Ships zero JS by default; perfect for content-heavy marketing pages; excellent SEO; still supports React islands for interactive demos |
| Language | TypeScript | Consistency with the app |
| Styling | CSS Modules + `packages/tokens` | Shares design tokens with the app |
| Deployment | **Vercel** | Zero-config Astro support; separate from the Docker product |
| Analytics | Umami (self-hosted) or Plausible | Privacy-first, no cookie banners |

**Pages:**
```
/                  ← Landing page (Hero, Features, Dib demo, CTA, Pricing teaser)
/pricing           ← Pricing tiers (Cloud / Self-hosted)
/about             ← Mission, the reef metaphor, team
/docs              ← Link to documentation hub (future)
/blog              ← Optional content marketing (future)
```

---

### `apps/app/` — The Product

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSR + RSC for server-side schema introspection; file-based routing; API routes for backend logic |
| Language | TypeScript | Required for schema type safety |
| Styling | CSS Modules + `packages/tokens` | Full design control, shared tokens |
| Auth | **Auth.js v5** | Free library; first-class OIDC support (self-hosted); Supabase adapter (cloud); one codebase, two auth modes via env vars |
| Database (app data) | **Supabase Postgres** (cloud) / **BYO Postgres** (self-hosted) | Stores user accounts, sources, Dib history |
| ORM | **Drizzle ORM** | Lightweight, TypeScript-first, works with any Postgres; no heavy abstraction |
| Deployment (cloud) | **Vercel** | Next.js native |
| Deployment (self-hosted) | **Docker** (single container) | Clean image — no marketing code |

**Route Inventory:**
```
(marketing)/                 ← Handled by apps/marketing/, not this app
(auth)/
  sign-in/                   ← Auth.js sign-in page
  sign-up/                   ← Email/password or OAuth registration
(app)/
  dashboard/                 ← Reef overview: source health, recent Dibs
  sources/                   ← List of connected databases
  sources/new/               ← Add source flow (connection string + test)
  sources/[id]/              ← Single source view: tables, stats
  dibs/                      ← All Dibs, filterable
  dibs/[id]/                 ← Single Dib view
  settings/                  ← Account, billing, team (future)
api/
  auth/[...nextauth]/        ← Auth.js handler
  sources/                   ← CRUD for data sources
  dibs/generate/             ← Trigger Dib generation
  dibs/[id]/                 ← Fetch Dib data
```

---

## Auth Architecture

### Dual-Mode Auth via Auth.js v5

Auth.js acts as the abstraction layer. The auth provider is configured entirely via environment variables — **no code changes needed between cloud and self-hosted deployments**.

```
┌─────────────────────────────────────────────────────┐
│               Next.js App (apps/app/)               │
│  ┌──────────────────────────────────────────────┐   │
│  │              Auth.js v5 (auth.ts)             │   │
│  │                                               │   │
│  │  if AUTH_PROVIDER=supabase:                   │   │
│  │    → Supabase OAuth + email auth              │   │
│  │    → Supabase DB adapter (sessions in PG)     │   │
│  │                                               │   │
│  │  if AUTH_PROVIDER=oidc:                       │   │
│  │    → Generic OIDC (Keycloak, Authentik, etc.) │   │
│  │    → BYO Postgres adapter (raw Postgres)      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Environment Variables — Auth

```bash
# ── Mode selector ──────────────────────────────────────
AUTH_PROVIDER=supabase          # or: oidc

# ── Auth.js secrets ────────────────────────────────────
AUTH_SECRET=your_nextauth_secret_here

# ── Supabase (cloud production) ────────────────────────
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...@db.supabase.co:5432/postgres

# ── OIDC (self-hosted) ──────────────────────────────────
AUTH_OIDC_ISSUER=https://your-idp.example.com
AUTH_OIDC_CLIENT_ID=databreef
AUTH_OIDC_CLIENT_SECRET=your_client_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/databreef
```

### File Layout — Auth

```
apps/app/src/lib/
├── auth.ts              ← Auth.js config: reads AUTH_PROVIDER, sets up providers
├── db.ts                ← DB client: reads DATABASE_URL, returns Drizzle instance
└── adapters/
    ├── index.ts         ← Exports correct adapter based on AUTH_PROVIDER
    ├── supabase.ts      ← Supabase DB adapter for Auth.js
    └── postgres.ts      ← Generic Postgres adapter for self-hosters
```

---

## Database Schema (App Data)

DataBreef's own data (not the user's databases — those are introspected read-only) stored in Supabase / BYO Postgres:

```sql
-- Users (managed by Auth.js adapter)
users (id, email, name, image, created_at)
accounts (id, user_id, provider, provider_account_id, ...)
sessions (id, user_id, expires, session_token)

-- Core product data
sources (
  id, user_id, name, db_type,
  connection_string_encrypted,  ← AES-256 encrypted at rest
  last_connected_at, status, created_at
)

dibs (
  id, source_id, user_id, title,
  summary, content_json,         ← Structured Dib content
  generated_at, model_version
)
```

> **Security**: Connection strings are encrypted with AES-256 before storage. The app NEVER stores plain-text credentials. Connections are made read-only at the Postgres level (connect with a READ ONLY role).

---

## Docker Strategy

Only `apps/app/` is containerized. The marketing site is a static deployment (Vercel/CDN).

```dockerfile
# docker/app.Dockerfile
FROM node:22-alpine AS base
# ... multi-stage build
# Final image: ~200MB target
```

### Self-Hosted Startup

```bash
docker pull databreef/app:latest
docker run -p 3000:3000 \
  -e AUTH_PROVIDER=oidc \
  -e AUTH_OIDC_ISSUER=https://your-idp.company.com \
  -e AUTH_OIDC_CLIENT_ID=databreef \
  -e AUTH_OIDC_CLIENT_SECRET=secret \
  -e AUTH_SECRET=generate_a_long_random_string \
  -e DATABASE_URL=postgresql://user:pass@host:5432/databreef \
  databreef/app:latest
```

Or with `docker-compose.yml` (provided in `docker/`).

---

## Shared Packages

### `packages/tokens/`

Publishes the CSS custom properties as a single importable stylesheet:
```
packages/tokens/
├── index.css        ← All :root CSS variables (colors, type, spacing, motion)
├── package.json     ← { "name": "@databreef/tokens", "exports": "./index.css" }
└── README.md
```

### `packages/ui/`

React component primitives shared between app (and future embeds):
```
packages/ui/
├── src/
│   ├── Button/
│   ├── Card/
│   ├── Badge/
│   ├── Input/
│   └── index.ts
├── package.json    ← { "name": "@databreef/ui" }
└── tsconfig.json
```

> ⚠️ `packages/ui/` initially contains stubs. Components are fully built within `apps/app/src/components/ui/` first, then extracted to the package when the marketing site needs them.

---

## Deployment Topology

```
                     ┌─────────────────────┐
                     │   databreef.io       │
                     │   (Vercel)           │
                     │   apps/marketing/   │
                     └─────────────────────┘

                     ┌─────────────────────┐
                     │   app.databreef.io  │
                     │   (Vercel)          │
                     │   apps/app/         │────→ Supabase (cloud DB + auth)
                     └─────────────────────┘

   Self-Hosted:      ┌─────────────────────┐
                     │   docker container  │
                     │   apps/app/         │────→ BYO Postgres + OIDC provider
                     └─────────────────────┘
```

---

## Security Model

DataBreef's **read-only guarantee** is enforced at multiple levels:

1. **Connection level**: All user-provided connection strings are connected with a Postgres `READ ONLY` transaction mode (`SET default_transaction_read_only = ON`)
2. **Query level**: Only `SELECT`, `EXPLAIN`, and catalog queries (`information_schema`, `pg_catalog`) are permitted. A query allowlist is enforced server-side.
3. **Drizzle ORM**: The schema introspection client is initialized without write capabilities
4. **No mutations in codebase**: No `INSERT`, `UPDATE`, `DELETE`, or DDL statements appear anywhere in the schema introspection codebase (enforced by ESLint rule)
5. **Audit log**: All connections to user databases are logged with timestamp, user ID, and query fingerprint (no raw query stored)

---

## Performance Strategy

- **Marketing site**: Static generation (Astro) → CDN edge delivery, ~100 Lighthouse score target
- **App**: RSC (React Server Components) for initial data fetch; client components only where interactivity needed
- **Dib generation**: Background jobs (consider Vercel Background Functions or a simple queue) — never blocks UI
- **Schema introspection**: Cached in the `sources` table — re-introspected on explicit user request or 24h TTL
- **Images**: `next/image` with WebP, lazy loading

---

## Development Setup

```bash
# Prerequisites: Node 22+, pnpm 9+

# 1. Install dependencies
pnpm install

# 2. Start marketing site
pnpm --filter marketing dev    # → http://localhost:4321

# 3. Start app
pnpm --filter app dev          # → http://localhost:3000

# 4. Build all
pnpm build
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `DibCard.tsx` |
| CSS module files | `.module.css` suffix | `DibCard.module.css` |
| Utility functions | camelCase | `formatSchemaName.ts` |
| API routes | kebab-case dirs | `api/dibs/generate/` |
| DB column names | snake_case | `connection_string_encrypted` |
| TypeScript types | PascalCase, no `I` prefix | `DataSource`, `Dib` |
| Env variables | SCREAMING_SNAKE_CASE | `AUTH_OIDC_ISSUER` |
| File size | ~300 lines max | Split modules when approaching 300 lines |

---

## AI Agent Standards

DataBreef is optimized for AI-driven development. All agents MUST follow the rules in `CLAUDE.md` and `AGENTS.md`:

1. **Max File Size**: 300 lines per source file.
2. **Modularization**: Proactively split logic and components.
3. **Context Efficiency**: Keep files small to minimize token usage and prevent rate limiting.
