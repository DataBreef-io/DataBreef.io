# Paperclip Skills & Integration Setup

**Version 1.0.0** · April 22, 2026  
**Companion to AGENT_GUIDELINES.md and MODEL_ROUTING_STRATEGY.md**

---

## 📦 Skills Manifest

Paperclip should have these skills installed and configured for optimal DataBreef.io support.

### Core Development Skills

| Skill | Purpose | Install From | Status |
|---|---|---|---|
| `docx` | Write design specs, roadmaps, guides | Cowork marketplace | **REQUIRED** |
| `pdf` | Extract setup docs, generate reports | Cowork marketplace | **REQUIRED** |
| `pptx` | Create sprint review decks, pitch materials | Cowork marketplace | **REQUIRED** |
| `xlsx` | Analyze metrics, create sprint dashboards | Cowork marketplace | **REQUIRED** |
| `skill-creator` | Create custom skills for agent workflows | Cowork marketplace | **OPTIONAL** (install after first month) |
| `schedule` | Schedule recurring tasks (tests, audits, reports) | Cowork marketplace | **OPTIONAL** (install for Sprint 4) |

### DataBreef.io Custom Skills (To Be Created)

These skills are specific to DataBreef and should be created using `skill-creator`:

#### 1. `databreef-setup`
**Purpose**: Onboard new agents to the DataBreef.io workspace

**Triggers**:
- "set up Paperclip for DataBreef"
- "initialize DataBreef agent"
- "configure for development"

**What it does**:
- Clone repo from GitHub
- Run `pnpm install`
- Set up `.env.local` with test credentials
- Run `pnpm type-check` + `pnpm test` to verify
- Output a "ready to code" checklist

**Files needed**:
```
paperclip/skills/databreef-setup/
├── SKILL.md (skill manifest)
├── setup.ts (main logic)
├── verify-env.ts (validate env vars)
└── test-run.ts (quick smoke test)
```

#### 2. `databreef-security-audit`
**Purpose**: Verify security rules are enforced

**Triggers**:
- "audit encryption in Task 7"
- "verify read-only enforcement"
- "security check before PR"

**What it does**:
- Grep for AES encryption usage + validate key derivation
- Verify every DB adapter has read-only transaction enforcement
- Check audit_events table structure
- Generate a security audit report
- Suggest fixes if issues found

**Files needed**:
```
paperclip/skills/databreef-security-audit/
├── SKILL.md
├── audit-encryption.ts
├── audit-read-only.ts
├── audit-logging.ts
└── generate-report.ts
```

#### 3. `databreef-sprint-status`
**Purpose**: Generate sprint status reports (automate the daily/weekly standup)

**Triggers**:
- "generate sprint 2 status"
- "what's left to ship"
- "sprint progress report"

**What it does**:
- Query git log for recent commits
- Cross-reference against roadmap tasks
- Calculate completion percentage per task
- Identify blockers from commit messages
- Generate markdown report ready for docs/ai-notes/

**Files needed**:
```
paperclip/skills/databreef-sprint-status/
├── SKILL.md
├── query-git.ts
├── map-to-roadmap.ts
└── generate-report.ts
```

#### 4. `databreef-test-runner` (Post-Sprint-2)
**Purpose**: Run test suite + coverage analysis

**Triggers**:
- "run tests and report coverage"
- "verify test suite after feature X"
- "check if tests hit 70% on lib/"

**What it does**:
- Run `pnpm test`
- Generate coverage report
- Flag files under 70% coverage
- Suggest test cases to improve coverage

**Status**: Defer to Sprint 3; include in post-launch automation.

---

## 🔌 Integrations to Configure

### GitHub Integration

**What Paperclip needs to do**:
- Clone the DataBreef.io repo
- Create feature branches
- Push commits + PRs
- Report build status

**Setup steps**:
1. In Paperclip, go to **Settings → Integrations → GitHub**
2. Authenticate with your GitHub account
3. Grant scope: `repo` (full control of private repos), `workflow` (create actions)
4. Configure:
   - **Default org**: `databreef-io` (you'll create this)
   - **Default repo**: `platform`
   - **Auto-PR on merge**: `true` (for CI flow)

**Personal Access Token** (if not using OAuth):
- Generate at https://github.com/settings/tokens/new
- Scopes: `repo`, `workflow`, `admin:org_hook`
- Store in Paperclip as `GITHUB_TOKEN` env var

### Claude API (Anthropic)

**What you need**:
- Anthropic API key (NOT ChatGPT)

**Setup steps**:
1. Get key from https://console.anthropic.com/account/keys
2. In Paperclip, set env var: `ANTHROPIC_API_KEY=sk-ant-...`
3. Test: Paperclip runs a simple task with Claude (architect agent)

### Google Gemini API

**What you need**:
- Google Cloud project + Gemini API key

**Setup steps**:
1. Go to https://aistudio.google.com/app/apikeys
2. Create API key (or use existing)
3. In Paperclip, set env var: `GOOGLE_API_KEY=...`
4. Test: Paperclip runs a simple task with Gemini (docs agent)

### Vercel (Deployment Preview)

**What Paperclip needs**:
- Ability to trigger preview deployments
- Read build logs

**Setup steps**:
1. Get Vercel API token from https://vercel.com/account/tokens
2. In Paperclip, set: `VERCEL_API_TOKEN=...`
3. Configure repo link:
   - Org: `databreef-io`
   - Project: `platform`
4. Paperclip can now trigger `vercel deploy --prod` for testing

### Sentry (Error Monitoring)

**Optional**: Let Paperclip check Sentry errors during agent work

**Setup**:
1. Get Sentry Auth Token from your Sentry project settings
2. Set `SENTRY_AUTH_TOKEN=...` in Paperclip
3. Paperclip can query recent errors before/after changes

### Slack (Notifications)

**Optional**: Get agent status updates in Slack

**Setup**:
1. Create a Slack app in your workspace: https://api.slack.com/apps/new
2. Enable "Incoming Webhooks" + "Slash Commands"
3. Add env var: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`
4. Paperclip will post:
   - Agent session start/end
   - PR opened
   - Build failure alerts

---

## 🛠️ Initial Paperclip Configuration File

Create this file in your Paperclip workspace:

**File**: `~/.paperclip/config.yaml`

```yaml
# DataBreef.io Paperclip Configuration
# Version: 1.0.0
# Last updated: 2026-04-22

workspace:
  name: "DataBreef.io"
  path: "/home/paperclip/workspaces/databreef.io"
  git_remote: "git@github.com:databreef-io/platform.git"
  git_branch: "main"

integrations:
  github:
    enabled: true
    org: "databreef-io"
    repo: "platform"
    auth_method: "personal_access_token"
    token_env_var: "GITHUB_TOKEN"
  
  anthropic:
    enabled: true
    api_key_env_var: "ANTHROPIC_API_KEY"
    models:
      architect: "claude-opus-4.6"
      executor: "claude-sonnet-4.6"
  
  google:
    enabled: true
    api_key_env_var: "GOOGLE_API_KEY"
    model: "gemini-2.0-flash"
  
  vercel:
    enabled: true
    api_token_env_var: "VERCEL_API_TOKEN"
    org: "databreef-io"
    project: "platform"
  
  slack:
    enabled: false  # Enable after first successful sprint
    webhook_url_env_var: "SLACK_WEBHOOK_URL"

agents:
  - name: "architect"
    model: "claude-opus-4.6"
    role: "Strategy & design decisions"
    max_sessions_per_day: 2
    task_type: "strategy"
    guidelines_file: "AGENT_GUIDELINES.md"
    
  - name: "executor"
    model: "claude-sonnet-4.6"
    role: "Feature implementation & testing"
    max_sessions_per_day: 4
    task_type: "feature_execution"
    guidelines_file: "AGENT_GUIDELINES.md"
    
  - name: "docs-support"
    model: "gemini-2.0-flash"
    role: "Documentation, boilerplate, parallel work"
    max_sessions_per_day: 6
    task_type: "documentation"
    guidelines_file: "AGENT_GUIDELINES.md"

skills:
  builtin:
    - docx
    - pdf
    - pptx
    - xlsx
  
  custom:
    - databreef-setup
    - databreef-security-audit
    - databreef-sprint-status
    # databreef-test-runner added in Sprint 3

observability:
  log_level: "info"
  log_file: "/var/log/paperclip/databreef.log"
  metrics_enabled: true
  alerts:
    - type: "cost_overage"
      threshold_usd: 150
      action: "pause_non_critical_agents"
    - type: "rate_limit"
      action: "switch_to_fallback_model"
    - type: "security_concern"
      action: "email darin@levesqueho.me"

rate_limits:
  claude_requests_per_hour: 40
  gemini_requests_per_hour: 60
  daily_cost_budget_usd: 150
  monthly_cost_budget_usd: 2000

schedule:
  # Sprint 2: Daily status report at 4pm PT
  daily_status:
    enabled: true
    cron: "0 16 * * *"  # 4pm PT
    task: "databreef-sprint-status"
  
  # Run type-check + tests nightly
  nightly_validation:
    enabled: true
    cron: "0 22 * * *"  # 10pm PT
    task: "run pnpm type-check && pnpm test"
```

---

## 🚀 Setup Checklist

Before Paperclip's first agent session, confirm:

- [ ] Paperclip instance running at `https://ai.levesqueho.me` ✓ (you have this)
- [ ] GitHub org `databreef-io` created (covered in next section)
- [ ] GitHub personal access token generated + stored in Paperclip env
- [ ] `ANTHROPIC_API_KEY` set in Paperclip env
- [ ] `GOOGLE_API_KEY` set in Paperclip env
- [ ] `~/.paperclip/config.yaml` created (use template above)
- [ ] Custom skills folder created: `paperclip/skills/`
- [ ] `databreef-setup` skill installed + tested (can clone + setup repo)
- [ ] One manual agent session run successfully (e.g., "generate a test file")
- [ ] Logs visible + no auth errors

---

## 📋 Next Steps

1. **Create GitHub organization** (see next section)
2. **Push local DataBreef.io to GitHub** (main branch)
3. **Set up Paperclip integrations** (follow integration checklist above)
4. **Create custom skills** (start with `databreef-setup`, then others)
5. **Run first agent session** with `AGENT_GUIDELINES.md` + this config
6. **Monitor costs** for first week, tune routing strategy

---

## 🔗 Related Docs

- `AGENT_GUIDELINES.md` — How agents should work
- `MODEL_ROUTING_STRATEGY.md` — How to allocate Claude vs. Gemini
- `../CLAUDE.md` — Core project rules
- `../docs/ai-notes/roadmap-refined-april-22.md` — What to build
