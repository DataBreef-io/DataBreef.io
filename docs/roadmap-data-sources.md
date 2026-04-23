# Data Source Roadmap — DataBreef

> **Last updated**: 2026-04-16
> **Master roadmap**: `docs/roadmap-mvp.md` — launch plan compresses the matrix below; see §3 of the MVP doc for what actually ships on **2026-05-18**.
> **TL;DR for launch**: PostgreSQL + MySQL are GA, MS SQL ships as a flagged **Preview**, everything else is post-launch.

This document outlines the long-term strategy for expanding DataBreef's reach to major database engines, while maintaining our strict **read-only** security model. For the next-month execution plan (payments, auth, SEO, pen-testing, etc.) see `docs/roadmap-mvp.md`.

## 🛡️ The Read-Only Trust Pillar

For every data source we add, we must solve the "Trust Problem." Users need to be 100% certain that DataBreef cannot mutate their data.

### Security Strategy for New Engines
1.  **Session Level**: We use native database flags (e.g., `SET TRANSACTION READ ONLY`) immediately upon connection.
2.  **User Level**: We provide "Recommended Policy" guides for each engine, helping users create the most restrictive database role possible.
3.  **Live Audit**: During introspection, the DataBreef UI provides a live stream of every SQL command executed, allowing users to verify that only `SELECT` and catalog queries are running.

---

## 🗺️ Connector Roadmap

Compressed to reflect the MVP launch target of **2026-05-18**:

| Stage | Data Source | Launch Status | Security Mechanism |
|---|---|---|---|
| **Phase 1** | **PostgreSQL** | ✅ GA — day 1 | `SET default_transaction_read_only = ON;` |
| **Phase 2** | **MySQL / MariaDB** | ✅ GA — day 1 (Sprint 2) | `SET SESSION TRANSACTION READ ONLY;` + `GRANT SELECT` |
| **Phase 3** | **MS SQL Server** | 🟡 **Preview** — launch, flagged | `APPLICATIONINTENT=READONLY` in connection string |
| **Phase 4** | **Snowflake** | 📅 Post-launch (Sprint 5+) | Role-based access (SaaS native) |
| **Phase 5** | **Oracle** | 📅 Post-launch | `SET TRANSACTION READ ONLY;` |
| **Phase 6** | **MongoDB** | 📅 Post-launch — needs NoSQL Dib schema first | `readPreference=secondaryPreferred` |

---

## 🏗️ Architectural Pattern: The Introspection Engine

To ensure codebase health, we use a **Strategy Pattern** for introspection. Adding a new source follows this repeatable checklist:

1.  **Define the Adapter**: Implement the `IntrospectionEngine` interface in `apps/app/src/lib/introspection/engines/`.
2.  **Define the Security Manifest**: Document the minimum viable permissions required for that specific engine.
3.  **Implement the Parser**: Convert engine-specific catalog data (e.g., `information_schema`) into the unified DataBreef `Schema` object.
4.  **UI Integration**: Add the engine to the "Anchor a Source" flow and update the branding icons.

---

## 📈 Impact on Shared Ecosystem

- **Marketing (`/docs/security`)**: Each engine gets its own security sub-page explaining the read-only technical enforcement.
- **Application (`/sources/new`)**: Users select their engine type first, which changes the credential fields and security tips displayed.
- **Audit Logs**: Logs are stored per-source, allowing teams to review historical introspection activity for compliance.
