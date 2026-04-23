# DataBreef App — Docker Image
# Only apps/app/ is containerized. The marketing site is deployed separately.
# Build from monorepo root: docker build -f docker/app.Dockerfile -t databreef/app .

FROM node:22-alpine AS base
RUN corepack enable pnpm

# ── Stage 1: Install dependencies ────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/ui/package.json ./packages/ui/
COPY apps/app/package.json ./apps/app/

# Install only production deps for the app
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build the app ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/app/node_modules ./apps/app/node_modules

# Copy source — only what's needed
COPY packages/ ./packages/
COPY apps/app/ ./apps/app/
COPY package.json pnpm-workspace.yaml ./

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter app build

# ── Stage 3: Runtime image ───────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/apps/app/.next/standalone ./
COPY --from=builder /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=builder /app/apps/app/public ./apps/app/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/app/server.js"]
