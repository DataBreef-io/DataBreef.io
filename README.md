# DataBreef
**Your schema, surfaced.**

DataBreef is a read-only database intelligence utility. Connect your PostgreSQL schema and receive **Dibs** — Data Intelligence Briefs — that surface trends, anomalies, relationships, and health indicators. DataBreef never mutates your data.

---

## Monorepo Structure

```
databreef.io/
├── apps/
│   ├── marketing/   # databreef.io — Astro 5 marketing site
│   └── app/         # app.databreef.io — Next.js 15 product
├── packages/
│   ├── tokens/      # @databreef/tokens — shared CSS design tokens
│   └── ui/          # @databreef/ui — shared React components
├── docker/          # Docker configuration for self-hosted deployments
└── docs/            # Architecture docs & AI agent notes
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9+

```bash
# Install dependencies
pnpm install

# Start marketing site → http://localhost:4321
pnpm --filter marketing dev

# Start app → http://localhost:3000
pnpm --filter app dev
```

## Self-Hosting (Docker)

```bash
docker pull databreef/app:latest
docker run -p 3000:3000 \
  -e AUTH_PROVIDER=oidc \
  -e AUTH_OIDC_ISSUER=https://your-idp.example.com \
  -e AUTH_OIDC_CLIENT_ID=databreef \
  -e AUTH_OIDC_CLIENT_SECRET=your_secret \
  -e AUTH_SECRET=generate_a_long_random_string \
  -e DATABASE_URL=postgresql://user:pass@host:5432/databreef \
  databreef/app:latest
```

See `docker/docker-compose.yml` for a full self-hosted reference configuration.

## Documentation

| Document | Description |
|---|---|
| [Design System](docs/design-system.md) | Ocean-themed design tokens, typography, component patterns |
| [Site Architecture](docs/site-architecture.md) | Stack decisions, auth model, deployment topology, security |
| [Agent Quick-Start](docs/ai-notes/project-overview.md) | For AI agents: what this is, how it's built, key files |
| [Decision Log](docs/ai-notes/decisions-log.md) | Why each technology was chosen |
| [Build Progress](docs/ai-notes/progress.md) | What's built, what's planned, what's next |

## Security Model

DataBreef enforces read-only access at multiple independent layers:
1. **Postgres connection** — `SET default_transaction_read_only = ON`
2. **Query allowlist** — only `SELECT` and catalog queries permitted
3. **Encrypted credentials** — connection strings encrypted at rest (AES-256)
4. **Audit log** — all connections logged with user ID and timestamp

## License

MIT — see `LICENSE` for details.

---

> Built with care. Themed after the ocean. The reef is your data — DataBreef helps you understand it.
