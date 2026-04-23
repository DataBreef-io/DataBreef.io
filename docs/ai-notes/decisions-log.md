# DataBreef — Architecture Decision Records (ADR)
> Append new records at the bottom. Never delete old records — mark them [SUPERSEDED] if overridden.
> Last updated: 2026-04-12

---

## ADR-001: Monorepo with Separate Apps (not a single Next.js project)

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
DataBreef has two surfaces: a marketing site and the actual app/product. The product is intended to be open-sourced as a self-hosted Docker container.

**Decision**:
Use a **pnpm workspace monorepo** with `apps/marketing/` (Astro) and `apps/app/` (Next.js) as separate applications. Shared design tokens and UI primitives live in `packages/`.

**Rationale**:
- Docker image cleanliness: only `apps/app/` is containerized — no marketing code in the image
- Right tool for each job: Astro for static marketing (zero JS, SEO), Next.js for interactive app
- Hard file-system boundaries enforce separation of concerns
- Shared `packages/tokens/` ensures design consistency without coupling the apps

**Rejected alternatives**:
- Single Next.js app with route groups and an env-var toggle: marketing code would still ship in Docker image; code smell

---

## ADR-002: Astro 5 for Marketing Site

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
Need a framework for the public-facing marketing site at databreef.io.

**Decision**:
Use **Astro 5**.

**Rationale**:
- Ships zero JS by default — best-in-class Lighthouse scores for marketing
- Static generation: entire site is a CDN-friendly HTML/CSS bundle
- Supports React islands: interactive elements (pricing calculator, live Dib demo) can use React
- Shares `packages/tokens/` CSS variables with the app
- Deploys to Vercel with zero config

---

## ADR-003: Next.js 15 (App Router) for the App

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
Need an app framework for the authenticated dashboard at app.databreef.io.

**Decision**:
Use **Next.js 15** with the App Router.

**Rationale**:
- React Server Components allow schema introspection to happen server-side (no client round-trips)
- App Router file-based routing cleanly maps to the route inventory
- API routes handle backend logic (auth callbacks, source CRUD, Dib generation triggers)
- Excellent Docker support via `output: 'standalone'` in `next.config.ts`
- Vercel is the native deployment target for cloud

---

## ADR-004: Auth.js v5 for Authentication

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
DataBreef needs auth for both a cloud SaaS version (using Supabase) and a self-hosted Docker deployment (where users bring their own OIDC provider).

**Decision**:
Use **Auth.js v5** (NextAuth) as the authentication abstraction layer.

**Rationale**:
- Free library — no auth vendor lock-in
- First-class OIDC support: self-hosters can use Keycloak, Authentik, Zitadel, etc.
- Supabase adapter available for cloud production
- Provider is fully configurable via environment variables — same codebase, two deployment modes
- De-facto standard for Next.js authentication

**How dual-mode works**:
```bash
# Cloud production
AUTH_PROVIDER=supabase → Auth.js uses Supabase OAuth/email + Supabase DB adapter

# Self-hosted
AUTH_PROVIDER=oidc → Auth.js uses generic OIDC provider + Postgres adapter
```

**Rejected alternatives**:
- Supabase Auth exclusively: couples self-hosted users to Supabase, not portable
- Clerk: paid service, not self-hostable, adds vendor dependency

---

## ADR-005: Drizzle ORM

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
Need an ORM/query builder for the app's own data (users, sources, Dibs) in Postgres.

**Decision**:
Use **Drizzle ORM**.

**Rationale**:
- TypeScript-first: schema is defined in TS, full type safety for queries
- Lightweight: no heavy abstraction, raw SQL escape hatch always available
- Works with any Postgres connection (Supabase, local, BYO)
- Drizzle Kit handles migrations — important for self-hosted deployments
- Not coupled to any specific Postgres host

---

## ADR-006: Vanilla CSS + CSS Modules (no Tailwind)

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
Styling approach for the entire project.

**Decision**:
Use **Vanilla CSS** with **CSS Modules** for component scoping, and the `@databreef/tokens` package as the source of truth for design tokens.

**Rationale**:
- Full control over the ocean design system — custom properties, animations, shadows
- No Tailwind purge/build overhead in Docker image
- CSS Modules ship zero runtime JavaScript
- `packages/tokens/index.css` is a single importable file — works in both Astro and Next.js
- Design tokens as CSS custom properties (`var(--color-foam)`) are self-documenting

---

## ADR-007: Supabase Postgres for Cloud App Data

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
Need a database to store app data (users, sources, Dibs) for the cloud version.

**Decision**:
Use **Supabase Postgres** for production cloud. Self-hosted users bring their own Postgres.

**Rationale**:
- Postgres is the right choice (DataBreef is PostgreSQL-focused)
- Supabase free tier: 500MB storage, sufficient to start
- Supabase includes connection pooling (PgBouncer) out of the box
- Auth.js has a native Supabase adapter
- Self-hosters use `DATABASE_URL` pointing to their own Postgres — Drizzle handles both

---

## ADR-008: Read-Only Security Model

**Date**: 2026-04-12
**Status**: Accepted

**Context**:
DataBreef's core value proposition is that it is a *read-only* tool. This must be enforced, not just promised.

**Decision**:
Enforce read-only access at multiple independent layers.

**Layers**:
1. **Connection**: `SET default_transaction_read_only = ON` on every user DB connection
2. **Query allowlist**: Only `SELECT` and catalog queries permitted server-side
3. **Codebase**: No write SQL anywhere in introspection code (future ESLint rule)
4. **Audit log**: Every connection to a user DB is logged (user ID, timestamp, query fingerprint)

**Rationale**:
Trust is DataBreef's primary product. A single breach of the read-only contract would be fatal to the product. Defense in depth is necessary.
