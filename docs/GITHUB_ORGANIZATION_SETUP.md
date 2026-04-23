# GitHub Organization Setup for DataBreef.io

**Version 1.0.0** · April 22, 2026

This guide walks you through creating a proper GitHub Organization for DataBreef.io, from org creation through repo + team structure.

---

## 📋 Pre-Setup Checklist

Before you start, make sure you have:

- [ ] A GitHub account (you likely have one)
- [ ] Owner access to any existing DataBreef.io repos (if migrating)
- [ ] Clear decision: public (OSS) vs. private (proprietary) repos
  - **Recommendation for MVP**: Private until May 18 launch + security audit complete, then evaluate OSS
- [ ] List of team members who need access (currently: Darin + Paperclip agents)

---

## 🎯 Part 1: Create the GitHub Organization

### Step 1: Go to GitHub

Visit https://github.com/orgs/new or click your profile → **Settings → Organizations → New organization**

### Step 2: Organization Details

**Field**: Organization name  
**Value**: `databreef-io`  
(Lowercase with hyphens; mirrors your domain)

**Field**: Billing email  
**Value**: `darinlevesque@gmail.com`

**Field**: Organization website (optional)  
**Value**: `https://databreef.io`

**Field**: Description (optional)  
**Value**: `DataBreef.io — Database introspection & intelligence briefs`

**Field**: Location (optional)  
**Value**: Your location (for legal/compliance records)

### Step 3: Confirm & Create

Click **Create organization** and verify your email if prompted.

---

## 👥 Part 2: Set Up Teams & Permissions

### Team 1: `core-team`
**Purpose**: Developers + decision makers (you + future hires)  
**Permissions**: Admin access to all repos  

**How to create**:
1. In org settings → **Teams → New team**
2. Team name: `core-team`
3. Team slug: `core-team` (auto-filled)
4. Team description: "Core development team"
5. Privacy: Private
6. Add members: Your GitHub username (set as owner)
7. Click **Create team**

### Team 2: `paperclip-agents`
**Purpose**: Automated agents (Paperclip) for 24/7 development  
**Permissions**: Can create branches, open PRs, merge (with review)

**How to create**:
1. **Teams → New team**
2. Team name: `paperclip-agents`
3. Team description: "Automated development agents"
4. Privacy: Private
5. Add members:
   - A machine account (see "Create a Machine Account" below)
   - OR a bot account (Paperclip uses bot auth)

### Team 3: `pentesters` (Post-MVP)
**Purpose**: External security contractors (for Sprint 4 pen-test)  
**Permissions**: Read-only access to specific branches

**How to create** (do this in Sprint 4):
1. **Teams → New team**
2. Name: `pentesters`
3. Privacy: Private
4. Add members: As contractor GitHub accounts join, add them
5. Grant them **read-only** access to the security branches

---

## 🤖 Part 3: Create a Machine Account for Paperclip

Paperclip agents need a dedicated GitHub account to commit + create PRs.

### Option A: Create a Bot User (Recommended)

1. Create a second GitHub account:
   - Username: `databreef-io-bot`
   - Email: `bot@databreef.io` (or `bot+github@levesqueho.me`)
   - Mark as "This is a bot account" in settings

2. Invite to org:
   - Org settings → **Members → Invite member**
   - Username: `databreef-io-bot`
   - Role: **Member** (not owner)

3. In **Teams**, add `databreef-io-bot` to `paperclip-agents` team

4. Give it repo access:
   - Go to repo → **Settings → Collaborators**
   - Add `databreef-io-bot` with role **Maintain** (can merge PRs, not admin)

### Option B: Use a Personal Access Token from Your Account

If you don't want a separate bot account:
1. Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Token name: `paperclip-databreef`
4. Scopes:
   - ✅ `repo` (full control)
   - ✅ `workflow` (create actions)
   - ✅ `admin:org_hook` (manage webhooks)
5. Expiration: 90 days (rotate quarterly)
6. Generate and copy the token
7. Store in Paperclip as env var: `GITHUB_TOKEN=ghp_...`

**Pros**: Simple, no extra account  
**Cons**: Token is tied to your account; security risk if leaked

**Recommendation**: Use bot account for production, PAT for testing.

---

## 📦 Part 4: Create Repositories

### Repository 1: `platform` (Main Codebase)

**Purpose**: Next.js app, Astro marketing site, all core logic

**How to create**:
1. Org home → **Repositories → New repository**
2. Repository name: `platform`
3. Description: "DataBreef.io main platform — Next.js + Astro"
4. Visibility: **Private** (until post-launch)
5. Initialize with:
   - ✅ Add a README
   - ✅ Add .gitignore (Node)
   - ✅ Add license (MIT, or your choice)
6. Click **Create repository**

**After creation**:
1. Go to **Settings → Collaborators and teams**
2. Add `core-team` with role **Admin**
3. Add `paperclip-agents` with role **Maintain**
4. Enable branch protection on `main`:
   - Settings → **Branches → Add rule**
   - Branch name pattern: `main`
   - Require pull request reviews before merging: ✅ (2 reviewers OR 1 if you're solo)
   - Require status checks to pass: ✅ (GitHub Actions)

### Repository 2: `docs` (Optional, Post-MVP)

**Purpose**: Standalone docs site + security policies  
**Create in Sprint 4 or post-launch**

---

## 🔐 Part 5: Set Up Branch Protection & CI/CD

### Branch Protection (Main Branch)

1. Go to repo → **Settings → Branches**
2. Add rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require at least 1 approval
   - ✅ Dismiss stale pull request approvals
   - ✅ Require code owner approval

### Code Owners File

Create `.github/CODEOWNERS` to define who reviews what:

```
# Security & crypto
src/lib/encryption.ts        @yourusername
src/lib/audit.ts             @yourusername
src/lib/db/adapters/         @yourusername

# Database adapters
src/lib/introspection/engines/  @yourusername

# Everything else
*                            @yourusername
```

(Paperclip agents can self-review; Darin approves before merge)

### GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml` in the repo:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: npm audit --production

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm build
```

---

## 🔑 Part 6: Configure Secrets

Paperclip agents will need access to environment variables. Store them as GitHub Secrets:

1. Repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add:
   - `DATABASE_URL`: Your Postgres connection string (encrypted)
   - `NEXTAUTH_SECRET`: Auth.js secret (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: `https://localhost:3000` (for dev)
   - `RESEND_API_KEY`: Resend email service key
   - `GOOGLE_ID` / `GOOGLE_SECRET`: OAuth credentials
   - `GITHUB_ID` / `GITHUB_SECRET`: OAuth credentials
   - `ENCRYPTION_KEY`: Your AES-256 encryption key

**Security note**: These secrets are encrypted at rest on GitHub and masked in logs. Paperclip agents can read them during CI runs but not export them.

---

## 📝 Part 7: Set Up README & Documentation

Create a comprehensive `README.md` at repo root:

```markdown
# DataBreef.io

> Your schema, surfaced. Database introspection & intelligence briefs.

## Quick Start

```bash
# Clone
git clone git@github.com:databreef-io/platform.git
cd platform

# Install
pnpm install

# Develop
pnpm dev

# Test
pnpm test

# Build
pnpm build
```

## Documentation

- **[Agent Guidelines](./paperclip/AGENT_GUIDELINES.md)** — How Paperclip agents work
- **[Design System](./docs/design-system.md)** — UI/UX principles
- **[Site Architecture](./docs/site-architecture.md)** — Tech stack decisions
- **[Roadmap](./docs/roadmap-mvp.md)** — Shipping timeline

## Security

- **[Security Policy](./SECURITY.md)** — How to report issues
- **[Data Privacy](./PRIVACY.md)** — What we collect

## License

MIT

## Status

🚀 Alpha (launching May 18, 2026)
```

---

## 🚀 Part 8: Push Your Local Code to GitHub

Once the repo is created on GitHub:

```bash
# In your local DataBreef.io directory
git remote add origin git@github.com:databreef-io/platform.git
git branch -M main
git push -u origin main
```

If you already have a remote, update it:

```bash
git remote set-url origin git@github.com:databreef-io/platform.git
git push -u origin main
```

---

## 📋 Post-Setup Checklist

- [ ] Organization `databreef-io` created
- [ ] Teams created: `core-team`, `paperclip-agents`, (+ `pentesters` post-MVP)
- [ ] Bot account created (or PAT generated)
- [ ] Repository `platform` created
- [ ] Branch protection on `main` enabled
- [ ] `.github/CODEOWNERS` file created
- [ ] `.github/workflows/ci.yml` created
- [ ] GitHub Secrets populated
- [ ] Local code pushed to `main`
- [ ] CI/CD pipeline runs successfully on first push
- [ ] Paperclip can authenticate (test: `git@github.com:databreef-io/platform.git` clone in Paperclip workspace)

---

## 🔄 Ongoing Maintenance

### Quarterly Tasks
- [ ] Rotate personal access tokens (if using PAT)
- [ ] Review team memberships
- [ ] Audit secret access logs

### Pre-Launch (Sprint 4)
- [ ] Finalize `SECURITY.md` policy
- [ ] Evaluate: keep private or go public after audit?
- [ ] Set up GitHub Sponsors or funding (if applicable)

### Post-Launch (Sprint 5)
- [ ] Migrate to public if desired
- [ ] Enable Discussions (community support)
- [ ] Set up GitHub Projects for public roadmap

---

## 🆘 Troubleshooting

**Q: Paperclip can't clone the repo**  
A: Verify `GITHUB_TOKEN` env var is set in Paperclip. Test with:
```bash
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

**Q: CI pipeline keeps failing**  
A: Check `.github/workflows/ci.yml` syntax. Run locally first:
```bash
pnpm install && pnpm type-check && pnpm test
```

**Q: How do I manage team access?**  
A: Org settings → **Teams** → select team → **Manage teams**. Add/remove members, adjust permissions.

---

## 🎯 You're Ready!

Once this is complete, Paperclip can:
- Clone the repo to its workspace
- Create feature branches
- Commit + push code
- Open PRs automatically
- Report CI results

Next: Configure Paperclip with `paperclip/SKILLS_AND_SETUP.md` + `AGENT_GUIDELINES.md`.
