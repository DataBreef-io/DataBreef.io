# DataBreef — Agent Quick-Start Guide
> Keep this file current. If you make architectural changes, update this file FIRST.
> Last updated: 2026-04-12

---

## What Is DataBreef?

A **read-only** database intelligence utility. Users connect a PostgreSQL schema via a secure read-only connection string. DataBreef introspects the schema and generates **Dibs** (Data Intelligence Briefs) — surfacing trends, anomalies, relationships, and health indicators. It NEVER mutates data.

## Two Surfaces

| Surface | Path | Framework | Live URL |
|---|---|---|---|
| Marketing site | `apps/marketing/` | Astro 5 | https://databreef.io |
| App (the product) | `apps/app/` | Next.js 15 (App Router) | https://app.databreef.io |

## Monorepo Setup

- **Package manager**: pnpm with workspaces
- **Root**: `c:\Users\darin\Development\databreef.io\`
- **Run marketing**: `pnpm --filter marketing dev` → `localhost:4321`
- **Run app**: `pnpm --filter app dev` → `localhost:3000`
- **Install deps**: `pnpm install` from root
- **Modularity**: Keep source files **under 300 lines**. Split modules proactiveley to ensure context efficiency (see `AGENTS.md`).

## Key Tech Decisions (see `decisions-log.md` for full rationale)

| Concern | Decision |
|---|---|
| Auth (cloud) | Auth.js v5 + Supabase adapter |
| Auth (self-hosted) | Auth.js v5 + OIDC + generic Postgres adapter |
| Database (app data) | Supabase Postgres (cloud) / BYO Postgres (self-hosted) |
| ORM | Drizzle ORM |
| Styling | Vanilla CSS + CSS Modules + `@databreef/tokens` package |
| Docker | Only `apps/app/` is containerized |

## Design System

Full spec: `docs/design-system.md`

**TL;DR for agents:**
- Theme: Ocean/reef — dark navy backgrounds, teal/aqua accents, seafoam whites
- Primary accent: `var(--color-foam)` = `hsl(172, 65%, 50%)`
- Background: `var(--color-abyss)` = `hsl(215, 45%, 7%)`
- Fonts: Cormorant Garamond (display), Outfit (UI/headings), Inter (body), JetBrains Mono (schema/code)
- All design tokens: `packages/tokens/index.css`
- Schema names/column names ALWAYS use `JetBrains Mono`

## Auth Modes

Controlled entirely by environment variables:
```bash
AUTH_PROVIDER=supabase  # Cloud production
AUTH_PROVIDER=oidc      # Self-hosted Docker
```
Auth config: `apps/app/src/lib/auth.ts`
DB adapter: `apps/app/src/lib/adapters/`

## Read-Only Security Contract

DataBreef NEVER mutates user data. Enforcement layers:
1. Postgres connection: `SET default_transaction_read_only = ON`
2. Query allowlist: only SELECT + catalog queries
3. No write operations in codebase (ESLint enforced — future)
4. All connections are logged (user ID + timestamp + query fingerprint)

## Dib Generation (NOT YET BUILT)

The AI/Dib generation pipeline is planned for a future phase. Placeholder routes exist in `apps/app/src/app/(app)/dibs/`. When building this:
- Background job (not blocking UI)
- Schema introspection cached in `sources` table (24h TTL)
- Dib output stored as `content_json` in `dibs` table

## Important Files

| File | Purpose |
|---|---|
| `docs/design-system.md` | Complete design token spec |
| `docs/site-architecture.md` | Stack decisions, env vars, security model |
| `docs/ai-notes/decisions-log.md` | WHY we chose each technology |
| `docs/ai-notes/progress.md` | What's built vs. what remains |
| `apps/app/src/lib/auth.ts` | Auth.js config |
| `apps/app/src/app/globals.css` | Design tokens wired into Next.js |
| `packages/tokens/index.css` | Source of truth for CSS variables |

## Vocabulary (Ocean Metaphor)

Use this in UI copy and aria labels:
- Database/source → "Reef" or "Source"
- Connect a database → "Anchor a source"  
- Generate a Dib → "Surface a brief"
- Loading → "Scanning depths..."
- Empty state → "Still waters"
- Dashboard → "Reef overview"
