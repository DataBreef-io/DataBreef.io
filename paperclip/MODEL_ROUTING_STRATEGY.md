# Paperclip Model Routing Strategy — Claude + Gemini Load Balancing

**Version 1.0.0** · April 22, 2026  
**For Darin's subscription allocations: Claude Pro + Gemini Advanced + token fallback**

---

## 🎯 Routing Philosophy

You have subscriptions to both Claude and Gemini. Instead of picking one, we'll **intelligently route tasks to the right model** based on complexity, cost, and time-sensitivity.

**Goal**: Maximize quality while keeping token burn rate sustainable for 24/7 agent orchestration.

---

## 📊 Model Comparison for DataBreef.io Work

| Dimension | Claude Sonnet 4.6 | Claude Opus 4.6 | Gemini 2.0 Flash | Tokens (fallback) |
|---|---|---|---|---|
| **Speed** | ⚡⚡⚡ Fast | ⚡⚡ Med | ⚡⚡⚡ Fast | N/A |
| **Code quality** | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Best | ⭐⭐⭐⭐ Good | N/A |
| **Cost per 1M tokens** | $3 (input) / $15 (output) | $15 (input) / $75 (output) | $0.075 (input) / $0.3 (output) | Subscription burn |
| **Best for** | Feature exec, tests, refactor | Strategy, security, complex decisions | Execution, docs, repetitive work | Overflow, off-hours |

---

## 🎬 Routing Rules

### Tier 1: **Strategy & Complex Decisions** → **Claude Opus**

Use Claude Opus when you're making architectural decisions, security reviews, or non-obvious trade-offs.

**Triggers**:
- Designing a new module or API route
- Resolving ambiguity in the roadmap
- Security review or encryption decisions
- Performance optimization that affects multiple systems
- Code review + approval-ready changes

**Example**: *Task 3 (Audit viewer). Deciding on pagination strategy, filter logic, index strategy? → Opus. Fast implementation once strategy is locked? → Sonnet.*

**Time box**: 30–60 min per session. Opus is powerful but expensive; don't let a session drift.

### Tier 2: **Feature Execution** → **Claude Sonnet**

Use Claude Sonnet for turning designs into code, building features, writing tests.

**Triggers**:
- Implementing a known feature (from roadmap)
- Writing unit tests
- Refactoring within agreed constraints
- Debugging known issues
- Building components from designs

**Example**: *Task 3 again. Implementing the `/settings/audit` route after strategy decided? → Sonnet.*

**Characteristics**:
- Fast, high quality, cost-efficient
- Great at following patterns
- Good at testing + refactor work

### Tier 3: **Execution & Documentation** → **Gemini 2.0 Flash**

Use Gemini for high-volume, repetitive, or low-ambiguity work. Gemini is **very fast and cheap**.

**Triggers**:
- Writing documentation / README updates
- Boilerplate code generation (e.g., new adapter file structure)
- Routine tests / mocks
- Data cleanup tasks
- Drafting commit messages, PR descriptions
- Parallel work (e.g., three agents running adapters simultaneously)

**Example**: *Task 4 (MS SQL adapter). After Opus designs the strategy, Gemini implements the boilerplate client + test scaffold. Sonnet refines + security-audits.*

**Characteristics**:
- **95% as good as Claude** for straightforward work
- **10–20x cheaper** than Opus
- **2–3x faster** than Sonnet
- Ideal for 24/7 background work

### Tier 4: **Overflow / After-Hours** → **Token Pool**

If you hit subscription rate limits or need off-hours work, use your token budget.

**Triggers**:
- Paperclip needs to run outside US business hours (Gemini available 24/7, but rate limits)
- Both Claude + Gemini subscriptions are at rate-limit ceiling
- You want to preserve subscription quota for the next day

---

## 🔄 Example Task Flow (Task 3: Audit Viewer)

Here's how a complex feature would route across models:

```
┌─ TASK 3: Audit Log Viewer at /settings/audit (3-4h)
│
├─ PHASE 1: Strategy (0.5h) → CLAUDE OPUS
│  ├─ Design pagination + filtering logic
│  ├─ Decide on table schema structure
│  ├─ Plan index strategy (what to query on)
│  └─ Output: Architecture doc + code skeleton
│
├─ PHASE 2: Implementation (2h) → CLAUDE SONNET + GEMINI
│  ├─ Build `/settings/audit/page.tsx` → SONNET
│  ├─ Write unit tests for filters → GEMINI
│  ├─ Build `audit-table.tsx` component → SONNET
│  ├─ Write integration test (happy path) → GEMINI
│  └─ Output: Working route, tested locally
│
├─ PHASE 3: Security + Polish (0.5h) → CLAUDE SONNET
│  ├─ Audit: encryption OK, queries safe from injection
│  ├─ Run axe DevTools → fix a11y issues
│  ├─ Code review against CLAUDE.md rules
│  ├─ Final test pass
│  └─ Output: PR-ready code
│
├─ PHASE 4: Docs (0.3h) → GEMINI
│  ├─ Draft PR description
│  ├─ Document the pagination strategy in code comments
│  └─ Output: PR + commit ready
│
└─ Result: High-quality feature, 3-4h wall time, cost-balanced
```

---

## 💰 Cost Estimate (Full Sprint 2)

**Assumptions**:
- Sprint 2 remaining: ~28 hours of active work (P0 + P1)
- Split: 30% Opus, 40% Sonnet, 30% Gemini
- Average tokens per hour: 180k (varies by complexity)

**Breakdown**:

| Model | Hours | Tokens | Cost | Notes |
|---|---|---|---|---|
| **Opus** (strategy) | 8.4h | ~1.5M | ~$112.50 | High-value decisions |
| **Sonnet** (exec) | 11.2h | ~2M | ~$45 | Feature + test work |
| **Gemini** (exec) | 8.4h | ~1.5M | ~$0.60 | Boilerplate + docs |
| **Tokens** (overflow) | — | Subscr. buffer | Variable | If rate-limited |
| **TOTAL** | 28h | ~5M | ~$158 + overflow | Estimated |

**Reality**: Claude subscriptions are flat-rate, so actual marginal cost is ~$30/month per sub. Tokens are the incremental cost if you hit rate limits.

---

## 🚀 Paperclip Configuration

### In your `paperclip.config.json` (or env):

```json
{
  "agents": [
    {
      "name": "architect",
      "task_type": "strategy",
      "primary_model": "claude-opus-4.6",
      "fallback_model": "claude-sonnet-4.6",
      "max_sessions_per_day": 2,
      "context_window": 200000,
      "rate_limit_handler": "queue_for_next_hour"
    },
    {
      "name": "executor",
      "task_type": "feature_execution",
      "primary_model": "claude-sonnet-4.6",
      "fallback_model": "gemini-2.0-flash",
      "max_sessions_per_day": 4,
      "context_window": 200000,
      "rate_limit_handler": "switch_to_fallback"
    },
    {
      "name": "docs-and-support",
      "task_type": "documentation",
      "primary_model": "gemini-2.0-flash",
      "fallback_model": "claude-sonnet-4.6",
      "max_sessions_per_day": 6,
      "context_window": 128000,
      "rate_limit_handler": "switch_to_fallback"
    }
  ],
  "rate_limit_policy": {
    "claude_hourly_requests": 40,
    "gemini_hourly_requests": 60,
    "token_fallback_budget": 500000,
    "daily_cost_ceiling": 150,
    "action_on_overage": "pause_non_critical_agents"
  },
  "observability": {
    "log_model_selection_decision": true,
    "track_cost_per_task": true,
    "alert_on_overage": "email darin@levesqueho.me"
  }
}
```

### Key Settings:

1. **Rate limit handler**: If Claude hits limits, switch to Gemini (not vice versa — Gemini is cheaper).
2. **Cost ceiling**: Stop non-critical agents if you hit $150/day (adjust based on your comfort).
3. **Observability**: Log every model selection so you can see patterns and tune over time.

---

## 📈 Monitoring & Tuning

**Weekly review**:
1. Check `paperclip-logs.json` for model selection patterns
2. Calculate actual cost vs. budget
3. If you're hitting Claude rate limits, increase Gemini allocation
4. If Gemini output quality is lacking, dial back Gemini percentage

**Monthly review**:
1. Compare feature delivery speed by model
2. Adjust tier assignments based on real data
3. Re-estimate Sprint 3 + 4 costs

---

## 🎯 Rules of Thumb

1. **Opus before Sonnet before Gemini** for decision-making (best ≠ cheapest)
2. **Sonnet for execution** (sweet spot of speed + quality + cost)
3. **Gemini for volume** (boilerplate, docs, tests, parallel work)
4. **Always include security review** (Sonnet or Opus, never Gemini alone)
5. **Token fallback** is your safety net, not your primary strategy

---

## 🔗 Integration with Agent Guidelines

This routing strategy complements `AGENT_GUIDELINES.md`:

- **Architect agent** runs Opus-first tasks (1–2 per sprint)
- **Executor agent** runs Sonnet-first tasks (3–4 per sprint)
- **Parallel support agents** (docs, tests) run Gemini-first tasks (2–3 per sprint)

All agents follow the same CLAUDE.md rules + security enforcement.

---

## Next Steps

1. **Paperclip Setup**: Integrate this routing config into your Paperclip instance
2. **API Keys**: Ensure ANTHROPIC_API_KEY (Claude) + GOOGLE_API_KEY (Gemini) are set in Paperclip env
3. **Test**: Run a small task (e.g., "write a test file") through each model to verify routing
4. **Monitor**: Check logs after first full sprint cycle and tune

**Questions?** Flag ambiguities in your first Paperclip PR. We'll refine the routing based on real data.
