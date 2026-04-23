# Agent Guidelines — DataBreef.io (Paperclip Runtime)

Every Paperclip agent working on this repo loads this file as part of its initial context on each heartbeat. It is intentionally short. If you are an agent reading this: these rules are binding — they override your defaults. If something here conflicts with a task you've been given, stop and leave a comment on the task rather than proceeding.

---

## 1. Identity and mission

- Product: DataBreef.io — a read-only database introspection tool that produces Data Intelligence Briefs ("Dibs").
- Current phase: pre-MVP. Launch target is **2026-05-18**. Ship-blocking regressions are the single worst outcome.
- Oceanic vocabulary used throughout the codebase: **Reef** (data source), **Anchor** (connecting), **Dive** (querying), **Surface** (presenting), **Dib** (the output artifact). Use this vocabulary when naming things.

---

## 2. Scope discipline — the hard rules

1. **Stay inside your allowed paths.** Your agent config declares them. A pre-commit hook in this worktree will reject writes outside those paths. Do not fight the hook — the hook is correct; your task was wrong.
2. **One task per heartbeat.** Check out exactly one task, work it to completion or to a stop condition, then exit. Do not pick up additional tasks in the same run.
3. **Stop conditions are non-negotiable.** Each agent config declares stop conditions (max files touched, max diff size, max attempts, max duration). Hitting one is a *successful* outcome — release the task with a comment explaining what you learned.
4. **Never edit `main` directly, never force-push, never rewrite history.** Your branches are `paperclip/auto/<agent>-<task>` or `paperclip/pr/<agent>-<task>`. That is the only place you write.
5. **Never touch secrets, `.env` files, or anything under `paperclip/deploy/`.** That's infrastructure.

---

## 3. Code quality — project conventions

These mirror `CLAUDE.md` at repo root but are restated here because you don't always read that file.

- **File size limit: 300 lines.** If a file you're editing approaches 300 lines, split it before adding more. Prefer nested feature directories (`components/features/auth/LoginForm/...`) over junk-drawer files.
- **Styling:** CSS Modules only. No Tailwind, no inline styles, no CSS-in-JS.
- **Database code must be read-only.** Every adapter enforces read-only transactions at the driver level. If you're modifying a database adapter and you don't see a read-only guard, that's a bug — fix it, don't ignore it.
- **Connection strings:** AES-256 encrypted before persistence. Never log, never print, never commit.
- **Design system compliance:** Consult `docs/design-system.md` before introducing new colors, spacing, typography, or component patterns. If something isn't covered, stop and open a discussion — don't invent.

---

## 4. Definition of Done (applies to every task)

A task is not done until **all** of these are true:

- [ ] Changes are confined to your allowed paths
- [ ] Diff is under the agent's `max_diff_lines` cap
- [ ] Local test run passes (if code change)
- [ ] Lint + typecheck pass
- [ ] No files exceed 300 lines
- [ ] Commit message follows: `<agent>(<scope>): <one-line summary>\n\nRefs: task-<id>`
- [ ] For auto-merge agents: branch pushed to `paperclip/auto/*`, PR opened with auto-merge enabled
- [ ] For PR-required agents: branch pushed to `paperclip/pr/*`, PR opened, assigned to @darinlevesque

If any check fails, release the task with a comment. Do not bypass.

---

## 5. When to stop and ask

Stop and leave a comment on the task (instead of completing it) if any of the following are true. This is not failure — it's the correct behavior.

- The task touches a domain you're not scoped for (e.g., doc-keeper finding a code bug)
- The fix requires schema or migration changes
- The task seems to conflict with a decision in `docs/ai-notes/decisions-log.md`
- You can't reproduce the bug described in under 15 minutes
- You've made 3 attempts and tests still fail
- You discover a security issue — log it and pause, never silently fix

Releasing a task you can't complete is strictly better than burning budget on a task you shouldn't attempt.

---

## 6. Budget and runtime awareness

- Your heartbeat has a per-run budget cap. If you see yourself approaching it, stop at a clean checkpoint — commit what's working, release the task, exit.
- Don't run exploratory searches that aren't narrowing toward an answer. If you've read 20 files and still don't know what to do, the task is underspecified — release it.
- Prefer targeted grep / glob over reading entire directories.
- Don't regenerate content you already have. Consult your prior commits on the task branch before rewriting.

---

## 7. What you should NEVER do

- Modify `package.json` dependencies without a PR (no trusted-zone path for this, ever)
- Change CI config (`.github/workflows/**`) — not in scope for any agent
- Delete tests "because they're failing" — if a test is wrong, fix the test in a PR with a human reviewer
- Commit commented-out code
- Commit `console.log` or `debugger` statements
- Add new npm packages in auto-merge branches
- Disable ESLint rules or TypeScript checks
- Make claims in docs/ai-notes that you didn't verify against the actual code or git history

---

## 8. Reading order on every heartbeat

When you wake up, read these in this order before picking up work:

1. This file (`paperclip/AGENT_GUIDELINES.md`)
2. Your agent config (`paperclip/agents/<your-name>.yaml`)
3. The goal ancestry for the task you're checking out (Paperclip supplies this)
4. `CLAUDE.md` at repo root (project-wide agent rules)
5. `docs/design-system.md` if you're touching any UI
6. `docs/ai-notes/decisions-log.md` if you're making a cross-cutting change

You do not need to re-read these within a single heartbeat — read once, work, exit.

---

## 9. Communicating with Darin

- PR descriptions: one paragraph on *what* changed, one paragraph on *why*, and a bullet list of anything you noticed but didn't address
- Task comments: plain English, no marketing tone, no apologies
- If you paused yourself because of a stop condition, say so explicitly: "Stopping at `max_files_touched=2`. Remaining work: <specific next steps>."
- Never claim work is done that isn't. If you skipped something, say you skipped it.

---

## 10. When in doubt

The priority order is:
1. **Don't break main.** Protects the launch.
2. **Don't burn budget.** Protects the experiment.
3. **Make forward progress.** Only after the two above.

An agent that quietly does nothing costs $0 and loses nothing. An agent that thrashes costs real money and erodes trust. If the choice is between doing nothing and doing something uncertain — do nothing and leave a comment.
