# DataBreef — Build Progress
> Update this file whenever significant work is completed or planned.
> **Active plan**: `docs/roadmap-mvp.md` — MVP launch target **2026-05-18**.
> Last updated: 2026-04-16

---

## Status Legend
- ✅ Complete
- 🔨 In Progress
- 📋 Planned (next up)
- 🔮 Future (not yet planned)
- ❌ Blocked

---

## Phase 1 — Scaffold & Foundation

| Item | Status | Notes |
|---|---|---|
| Monorepo root (pnpm workspace) | ✅ | `pnpm-workspace.yaml`, root `package.json` |
| `docs/design-system.md` | ✅ | Full ocean design token spec |
| `docs/site-architecture.md` | ✅ | Stack decisions, env vars, security model |
| `docs/ai-notes/project-overview.md` | ✅ | Agent quick-start |
| `docs/ai-notes/decisions-log.md` | ✅ | ADR-001 through ADR-008 |
| `docs/ai-notes/progress.md` | ✅ | This file |
| Root `README.md` | ✅ | |
| `.gitignore` | ✅ | |
| `packages/tokens/index.css` | ✅ | All CSS custom properties |
| `packages/tokens/package.json` | ✅ | `@databreef/tokens` |
| `packages/ui/` stubs | ✅ | Placeholder package |
| `docker/app.Dockerfile` | ✅ | Multi-stage Next.js build |
| `docker/docker-compose.yml` | ✅ | Self-hosted reference config |

## Phase 2 — Marketing Site (`apps/marketing/`)

| Item | Status | Notes |
|---|---|---|
| Astro 5 bootstrap | ✅ | TypeScript, minimal |
| Design tokens imported | ✅ | From `@databreef/tokens` |
| Landing page (`/`) | 🔨 | Hero, Features, Dib demo, CTA sections (shell only) |
| Navbar component | 📋 | Logo, nav links, CTA button |
| Footer component | 📋 | |
| `/pricing` page | 🔮 | |
| `/about` page | 🔮 | |

## Phase 3 — App (`apps/app/`)

| Item | Status | Notes |
|---|---|---|
| Next.js 15 bootstrap | ✅ | TypeScript, App Router, no Tailwind |
| Design tokens (`globals.css`) | ✅ | Imports from `@databreef/tokens` |
| Root layout + font imports | ✅ | Cormorant Garamond, Outfit, Inter, JetBrains Mono |
| App shell (sidebar + topbar) | 📋 | Layout.tsx for (app) route group |
| Auth shell | 📋 | Layout.tsx for (auth) route group |
| `lib/auth.ts` | 📋 | Auth.js v5 config (dual-mode) |
| `lib/db.ts` | 📋 | Drizzle + env-based DB client |
| `lib/adapters/supabase.ts` | 📋 | |
| `lib/adapters/postgres.ts` | 📋 | |
| `/dashboard` page | 🔮 | |
| `/sources` page | 🔮 | |
| `/sources/new` flow | 🔮 | |
| `/dibs` page | 🔮 | |
| `/dibs/[id]` page | 🔮 | |
| `/sign-in` page | 🔮 | |
| `/sign-up` page | 🔮 | |

## Phase 4 — Dib Generation Engine

| Item | Status | Notes |
|---|---|---|
| Schema introspection client | 🔮 | Read-only Postgres connection, catalog queries |
| Query allowlist enforcer | 🔮 | Server-side security layer |
| Dib content generator | 🔮 | LLM integration TBD |
| Background job runner | 🔮 | Vercel Background Functions or queue |
| Dib storage schema | 🔮 | Drizzle schema + migrations |

## Phase 5 — Production Readiness

| Item | Status | Notes |
|---|---|---|
| Vercel deployments configured | 🔮 | app.databreef.io + databreef.io |
| Docker image published | 🔮 | `databreef/app` on Docker Hub |
| Analytics (Umami/Plausible) | 🔮 | |
| Error monitoring | 🔮 | Sentry or similar |
| Uptime monitoring | 🔮 | |
| Audit logging | 🔮 | All user DB connections logged |

---

## Current Sprint Focus

**Sprint 1 — Foundation (Apr 20 – Apr 26)**. See `docs/roadmap-mvp.md` §5 for the full four-sprint launch plan. Must-land this sprint: Auth.js v5 dual-mode wired, Supabase prod+staging with PITR, Drizzle schema v1 migrated, envelope-encrypted connection strings, Sentry + Axiom + Better Stack observability in place, and the first legal-pages draft submitted for counsel review.
