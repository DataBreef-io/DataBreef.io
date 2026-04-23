# Paperclip Setup Guide for DataBreef.io

**Status:** Draft — ready to execute
**Author:** Claude (in collaboration with Darin)
**Date:** 2026-04-21
**Context:** Pre-launch (Sprint 2, launch May 18). Two prior Paperclip attempts: (1) inconsistent implementations across installs, (2) agent burned $30 overnight with no real output.

---

## 0. Why this document exists

The two failures have the same root cause: **Paperclip is unopinionated by design**, so every fresh install diverges unless the config is treated like any other part of the codebase — version-controlled, reviewed, reproducible. This guide locks in one configuration we can rebuild from scratch in under an hour, and layers seven guardrails on top of Paperclip's default budget hard-stop so the $30 burn scenario can't happen again.

**Decisions already made (see chat transcript Apr 21):**
- Hosting: **VPS** (true 24/7)
- Autonomy: **Trusted zones** — agents auto-merge to `docs/`, `tests/`, `ai-notes/`; PRs required for `src/` and everything else
- Scope: **Bug triage, test coverage, docs upkeep, feature work from MVP roadmap**
- Budget ceiling: **$150/mo total**

---

## 1. Architecture — what runs where

```
┌─────────────────────────────────────────────────────────────┐
│  VPS (Hostinger KVM 2 or DigitalOcean $12 droplet)         │
│                                                             │
│   ┌────────────────────────┐    ┌───────────────────────┐  │
│   │  Paperclip server       │◄──►│  Postgres (Paperclip) │  │
│   │  (Node.js + React UI)   │    │  - agent state        │  │
│   │  Port 3000              │    │  - task board         │  │
│   │                         │    │  - budget ledger      │  │
│   └──────────┬──────────────┘    └───────────────────────┘  │
│              │ heartbeats                                   │
│              ▼                                              │
│   ┌────────────────────────┐                                │
│   │  Agent runtime workers  │                                │
│   │  (claude_local adapter) │                                │
│   │  Each runs in its own   │                                │
│   │  git worktree of        │                                │
│   │  databreef.io repo      │                                │
│   └────────────────────────┘                                │
└─────────────────────────────────────────────────────────────┘
             │                        │
             │ pushes branches        │ opens PRs
             ▼                        ▼
      ┌─────────────────────────────────────┐
      │  GitHub (databreef.io repo)         │
      │  - main (protected)                 │
      │  - paperclip/auto/* (auto-merge OK) │
      │  - paperclip/pr/*   (PR required)   │
      └─────────────────────────────────────┘
```

**Key insight:** Paperclip's *config* lives inside DataBreef at `/paperclip/`. Paperclip's *runtime* lives on the VPS. No separate repo needed — the config is part of the product it manages.

---

## 2. Repository layout (inside databreef.io)

Add this to the repo root. This is the single source of truth the VPS pulls on deploy, and it is reviewable in PRs like any other code change.

```
databreef.io/
├── paperclip/
│   ├── README.md                  # "What is this folder?"
│   ├── AGENT_GUIDELINES.md        # Rules every agent receives as its system prompt
│   ├── company.yaml               # Mission, top-level goals, budget
│   ├── agents/
│   │   ├── test-writer.yaml       # Test coverage agent
│   │   ├── doc-keeper.yaml        # Docs + ai-notes agent
│   │   ├── bug-fixer.yaml         # Bug triage & fixes
│   │   └── feature-builder.yaml   # MVP roadmap features
│   ├── goals/
│   │   ├── 01-mvp-launch.yaml     # Ship by May 18
│   │   ├── 02-test-coverage.yaml  # ≥70% unit coverage
│   │   └── 03-docs-sync.yaml      # ai-notes current within 24h of merges
│   ├── deploy/
│   │   ├── docker-compose.yml     # Paperclip + Postgres on the VPS
│   │   ├── .env.example           # Secrets template (never commit .env)
│   │   └── provision.sh           # One-shot VPS bootstrap
│   └── scripts/
│       ├── kill-switch.sh         # `ssh vps 'kill-switch.sh'` halts all agents
│       ├── budget-check.sh        # Cron: alert if >50% spent before month half
│       └── no-progress-check.sh   # Cron: pause any agent with 3 consecutive no-change heartbeats
```

---

## 3. Phase 0 — VPS provisioning (1–2 hours, do once)

**Recommended provider:** Hostinger KVM 2 (8 GB / 2 vCPU / ~$10/mo) — confirmed adequate in [Hostinger's Paperclip tutorial](https://www.hostinger.com/tutorials/paperclip-ai-use-cases). DigitalOcean or Hetzner equivalents also fine.

Steps:
1. Provision Ubuntu 22.04 droplet. SSH key only, no password auth.
2. `ufw` → allow 22 (SSH) and 3000 (Paperclip UI) only. Put Paperclip behind Cloudflare Tunnel or Tailscale if you want to avoid exposing 3000.
3. Install Docker + docker-compose.
4. Clone `databreef.io` into `/opt/databreef/`.
5. `cd /opt/databreef/paperclip/deploy && cp .env.example .env` → fill in `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL`.
6. `docker-compose up -d`.
7. Browse to `https://<your-domain>/` and complete `npx paperclipai onboard --yes` on first boot.

Full provisioning is scripted in `paperclip/deploy/provision.sh` (to be written during execution — the shape above is the contract).

---

## 4. Phase 1 — First agent only (week 1)

**Do not launch all four agents at once.** The $30 burn happened because an unattended agent ran against an ill-scoped task. Start with the lowest-risk agent, observe for 5–7 days, then add the next.

Week 1 agent: **doc-keeper** (see §6). Why first:
- Narrow scope (only touches `docs/` and `docs/ai-notes/`) → it's literally impossible to break production code
- Trusted-zone policy means it auto-merges, so end-to-end plumbing gets exercised
- Easy to tell if it's working (are the docs actually getting better?)
- Budget cap: **$15/mo** — if it burns this much before month-end, we've learned something for free

Daily ritual during week 1: check `paperclip.yourdomain.com` each morning. Look at the heartbeat log. If anything looks off, kill-switch it.

---

## 5. Phase 2 — Add agents one per week

| Week | Agent added       | Budget cap | Gate before enabling                           |
|------|-------------------|------------|------------------------------------------------|
| 2    | doc-keeper        | $15/mo     | (already live from Phase 1)                    |
| 3    | test-writer       | $35/mo     | doc-keeper has shipped ≥5 clean auto-merges    |
| 4    | bug-fixer         | $50/mo     | test-writer has shipped ≥3 PRs you've merged   |
| 5    | feature-builder   | $50/mo     | bug-fixer has shipped ≥3 PRs you've merged     |
|      | **Total**         | **$150**   |                                                |

The gates matter. If an agent isn't shipping quality work, don't add more agents — debug the one that's struggling. Otherwise you compound the problem.

---

## 6. Agent specifications

Each agent is defined by a YAML file in `paperclip/agents/`. The structure below is conceptual — match it to Paperclip's actual config schema during onboarding.

### 6.1 doc-keeper
- **Adapter:** `claude_local` with `claude-haiku-4-5` (cheap; docs don't need Opus)
- **Working directory:** git worktree of `main` at `/opt/databreef/worktrees/doc-keeper`
- **Allowed paths:** `docs/**`, `docs/ai-notes/**`, `README.md`
- **Forbidden paths:** everything else (enforced by a pre-commit hook in the worktree — see §9)
- **Trusted zone:** yes → pushes to `paperclip/auto/docs-*` branches with auto-merge enabled
- **Heartbeat:** every 4 hours
- **Max concurrent runs:** 1
- **Budget:** $15/mo; warn at 80%, stop at 100%
- **Task sources:** scans `git log` since last heartbeat for merges that likely need doc updates
- **Definition of done** (per task): changed files under `docs/`, all internal links resolve, markdown-lint passes, commit message references the PR that prompted the update

### 6.2 test-writer
- **Adapter:** `claude_local` with `claude-sonnet-4-6`
- **Allowed paths:** `**/*.test.ts`, `**/*.test.tsx`, `tests/**`, `vitest.config.*`
- **Forbidden paths:** `src/**` production code (reads it, never writes)
- **Trusted zone:** yes → `paperclip/auto/tests-*` with auto-merge when CI green
- **Heartbeat:** every 6 hours
- **Budget:** $35/mo
- **Task sources:** coverage reports; files under 60% line coverage ranked by recency of change
- **Stop condition:** max 2 files touched per task; if tests fail after 3 attempts, open an issue and release the task

### 6.3 bug-fixer
- **Adapter:** `claude_local` with `claude-sonnet-4-6`
- **Allowed paths:** `src/**` (but PR required — no trusted zone)
- **Trusted zone:** no → `paperclip/pr/bug-*`, always human review
- **Heartbeat:** every 8 hours
- **Budget:** $50/mo
- **Task sources:** GitHub issues labeled `bug` + `agent-ok`; agent must never pick an unlabeled issue
- **Stop condition:** reproduces in ≤15 minutes or releases the task and adds a comment explaining why

### 6.4 feature-builder
- **Adapter:** `claude_local` with `claude-opus-4-6` (worth it for feature work)
- **Allowed paths:** `src/**`, `tests/**`, `docs/**`
- **Trusted zone:** no → `paperclip/pr/feat-*`
- **Heartbeat:** every 12 hours (slow cadence; each run does real work)
- **Budget:** $50/mo
- **Task sources:** only tasks pulled from `docs/roadmap-mvp.md` and explicitly tagged `agent-ready` by a human
- **Stop condition:** if a task touches more than 5 files or the diff exceeds 400 lines, stop and ask

---

## 7. Company, goals, and task flow

`paperclip/company.yaml` (conceptual):

```yaml
name: DataBreef.io
mission: >
  Build a database introspection tool that surfaces business-relevant
  insights (Data Intelligence Briefs / "Dibs") from read-only connections
  to user databases. Ship MVP by 2026-05-18.
budget:
  monthly_total_usd: 150
  company_wide_pause_at_percent: 90   # 2nd line of defense beyond per-agent caps
projects:
  - id: mvp-launch
    goal_ref: 01-mvp-launch
  - id: quality
    goal_refs: [02-test-coverage, 03-docs-sync]
```

`paperclip/goals/01-mvp-launch.yaml`:

```yaml
id: 01-mvp-launch
title: Ship MVP launch (public) by 2026-05-18
context: |
  Sprint 2 is 85% complete as of 2026-04-21. Remaining: email service
  verification (2h), OAuth (1h), MS SQL adapter (5h), marketing (4h),
  testing (3h). Sprint 3 adds commerce/payments. Sprint 4 is launch prep.
definition_of_done:
  - MS SQL adapter shipped with integration tests
  - OAuth login verified end-to-end in production
  - Marketing site deployed with working signup flow
  - Test coverage ≥70% on src/adapters and src/auth
agents_in_scope: [feature-builder, test-writer, doc-keeper]
```

Task flow the agents will use:
1. Heartbeat wakes agent
2. Agent calls Paperclip API to check out a task (atomic — no double-assignment)
3. Agent reads `paperclip/AGENT_GUIDELINES.md` + the goal ancestry of the task
4. Agent works in its dedicated git worktree
5. On completion: push branch, open PR (or auto-merge if in trusted zone), mark task done
6. On stop condition hit: release task with explanation comment, exit heartbeat

---

## 8. The seven guardrails against the $30 burn

Paperclip's default is a single guardrail: hard-stop at 100% of monthly budget. That's why it didn't help you before. Stack these on top of it:

**1. Per-task budget cap.** Each agent config declares `max_usd_per_task`. The pre-commit hook aborts if the task's spend exceeds it. Prevents one stuck task from eating a month of budget.

**2. Per-heartbeat budget cap.** Same idea, one level up. If a single heartbeat spends more than, e.g., $2 for doc-keeper or $10 for feature-builder, it auto-pauses.

**3. No-progress detector.** `paperclip/scripts/no-progress-check.sh` runs via cron every 15 minutes. If an agent has completed ≥3 consecutive heartbeats with zero file changes and zero task status changes, it's paused. Directly addresses [GitHub issue #390](https://github.com/paperclipai/paperclip/issues/390).

**4. File-scope allowlist.** Each worktree has a pre-commit hook that rejects writes outside the agent's allowed paths. An agent that can only touch `docs/` literally cannot burn budget fixing a bug in `src/auth`.

**5. Loop detector at the heartbeat level.** If an agent opens the same file 5+ times with no net change in a single heartbeat, the heartbeat is aborted.

**6. Company-wide soft cap at 90%.** Paperclip pauses the whole company (not just the offending agent) when aggregate spend hits 90% of $150 = $135. Leaves $15 of headroom for you to triage.

**7. SMS / email alert at 50% spend before month half.** `paperclip/scripts/budget-check.sh` runs daily. If `day_of_month < 15` and `spend > $75`, it alerts. This is the early warning the prior setups never had.

The $30 overnight burn would have been caught by #2, #3, and #5 — each independently.

---

## 9. Trusted zones — implementation details

Auto-merge flow for `doc-keeper` and `test-writer`:

1. Agent pushes to `paperclip/auto/<agent>-<task-id>` branch
2. GitHub Action runs: markdown-lint (for docs) or `pnpm test` (for tests)
3. Branch protection on `main` requires status checks + 0 approvals for `paperclip/auto/**` — enabled via `.github/CODEOWNERS` rule
4. GitHub's auto-merge merges the PR once checks pass
5. Agent reports completion

PR-required flow for `bug-fixer` and `feature-builder`:

1. Agent pushes to `paperclip/pr/<agent>-<task-id>`
2. PR opens against `main` with auto-merge **off**
3. You review, approve, merge manually
4. Agent's task is marked done only after merge (webhook-driven)

Branch protection config lives in `paperclip/deploy/github-branch-protection.json` and is applied via `gh api` in `provision.sh`.

---

## 10. Daily / weekly operations

**Each morning (2 min):**
- Open Paperclip dashboard
- Glance at agent health, budget burn, any paused agents
- Check the PR queue for anything needing review

**Each Friday (10 min):**
- Review week's merged work (trusted-zone auto-merges included)
- Update task labels for the next week
- Sanity-check budget pacing

**Kill switch (any time):**
```bash
ssh vps '/opt/databreef/paperclip/scripts/kill-switch.sh'
```
This script pauses the whole company via Paperclip's API. Agents stop at their next heartbeat boundary (seconds, not minutes). Unpause from the dashboard when you're ready.

---

## 11. Success metrics — how you know it's working

After 30 days:
- Zero budget overruns (month ends under $150)
- doc-keeper: ≥15 auto-merged doc updates, zero malformed markdown shipped
- test-writer: coverage up ≥10 percentage points on targeted modules
- bug-fixer: ≥5 PRs merged, ≤2 rolled back
- feature-builder: ≥2 roadmap tasks shipped, ≤1 reverted
- Zero incidents of the kind that made you write this doc

If any of those are red, pause that agent and diagnose before continuing.

---

## 12. Next concrete steps (Darin's side)

1. Provision VPS (30 min)
2. Create the `paperclip/` directory and copy `AGENT_GUIDELINES.md` (delivered alongside this guide) into it
3. Fill in `company.yaml` and the four agent YAML files using the specs in §6
4. Run `docker-compose up -d` on the VPS, complete onboarding
5. Start only `doc-keeper` — leave other agents disabled in the UI
6. Observe for 5–7 days, then follow the Phase 2 rollout table

---

## Sources

- [Paperclip — The human control plane for AI labor](https://paperclip.ing/)
- [GitHub: paperclipai/paperclip](https://github.com/paperclipai/paperclip)
- [Architecture docs](https://docs.paperclip.ing/start/architecture)
- [Managing Agents guide](https://docs.paperclip.ing/guides/board-operator/managing-agents)
- [Issue #390 — Agent circuit breaker / loop detection](https://github.com/paperclipai/paperclip/issues/390)
- [Issue #447 — Agentic panic infinite loop](https://github.com/paperclipai/paperclip/issues/447)
- [Paperclip AI Cost Management (YouTube walkthrough)](https://www.youtube.com/watch?v=UIdH5Ac1Db8)
- [Hostinger Paperclip tutorial (VPS sizing)](https://www.hostinger.com/tutorials/paperclip-ai-use-cases)
- [How to Build a Multi-Agent Company with Paperclip and Claude Code (MindStudio)](https://www.mindstudio.ai/blog/how-to-build-multi-agent-company-paperclip-claude-code)
