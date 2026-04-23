---
id: ceo-01-bootstrap
assignee: ceo
priority: P0
goal_ref: 01-mvp-launch
status: ready
created: 2026-04-21
due: 2026-04-28
estimated_budget_usd: 4
max_heartbeats: 3
---

# CEO-01 — Bootstrap the company and hire your first report

## Why this task exists

You are the first agent to spin up inside DataBreef's Paperclip company. There
are no workers yet. The roadmap says the MVP ships **2026-05-18**. Sprint 2 is
reportedly 85% complete and 2+ days ahead of schedule, but nobody has
independently verified that claim against the code since it was written by the
same person who wrote the status doc.

Your job in this first task is to land, read the room, and hire exactly one
worker — **doc-keeper** — into service. Not all four. Hiring the full team on
day one is how the prior Paperclip attempt burned $30 overnight.

## What "done" looks like

By the time you close this task, the repository must contain **all** of the
following, each in its own commit on `paperclip/pr/ceo-01-bootstrap`:

1. **A state-of-the-company memo** at `docs/ai-notes/ceo-week-1-memo.md`
   covering:
   - What you verified independently about Sprint 2 status (did the claims in
     `sprint-2-status-april-21.md` hold up when you grepped the code?)
   - The three biggest risks to the May 18 launch, ranked
   - What you're *not* doing this week and why
   Max 2 pages. Plain prose, no bulleted filler.

2. **A doc-keeper agent spec** at `paperclip/agents/doc-keeper.yaml`, filled in
   against the contract in `docs/ai-notes/paperclip-setup-guide.md` §6.1.
   Do not invent fields the guide doesn't sanction. If something is unclear,
   note it in the memo and leave the field blank with a `# TODO:` comment.

3. **Three initial tasks for doc-keeper** in `paperclip/tasks/doc-*.md`, each
   with a clear Definition of Done, scoped entirely within `docs/**`. Pick the
   three highest-leverage doc updates you can see right now — e.g. reconciling
   the sprint status docs with reality, closing stale cross-links, or writing
   the one missing section a new contributor would need. No speculative work.

4. **A one-week execution plan** at `docs/ai-notes/ceo-week-1-plan.md`:
   - Day-by-day (Apr 22 – Apr 28) of what you'll attempt
   - Gate criteria for opening Phase 2 (hiring test-writer)
   - Explicit "I will NOT do X this week" list
   - Budget pacing target (you have $25/mo; spend ≤$8 this week)

5. **A hiring log entry** at `docs/ai-notes/hiring-log.md` (create the file if
   absent) recording: which agent was hired, on what date, against which budget
   cap, with what scope. This file becomes the running record of the team.

## How to approach it

Read, in order: `paperclip/AGENT_GUIDELINES.md`, `paperclip/MISSION.md`,
`paperclip/company.yaml`, `paperclip/goals/01-mvp-launch.yaml`,
`docs/roadmap-mvp.md`, `docs/ai-notes/paperclip-setup-guide.md`, then the two
most recent Sprint 2 status docs. Then skim `src/` structure with `glob` and
`grep`; do not open more than 15 source files — you are looking for the shape
of the thing, not writing code.

Verify before you trust. The status doc claims session persistence works, the
dashboard displays stats, email verification is built, MySQL adapter is built.
Grep for the referenced files and functions. If a claim names a file that
doesn't exist, note it in the memo — that is exactly the kind of drift a CEO
catches.

When you write doc-keeper's three tasks, remember: doc-keeper is an agent, not
a human. Tasks must be concrete, single-outcome, and verifiable without
judgment. "Improve the docs" is not a task. "Reconcile the three sprint-2
status files into a single canonical status doc and delete the older two after
confirming no inbound links break" is a task.

## What you must NOT do

- Do not hire more than one worker agent. doc-keeper only. No test-writer yet.
- Do not edit `src/`, `tests/`, or any file under `paperclip/deploy/`.
- Do not modify `company.yaml`, `goals/`, or the existing agent guidelines in
  this task. If you think any of them are wrong, say so in the memo and open a
  **separate** PR for Darin to review.
- Do not invent code claims in the memo. If you didn't verify it against the
  repo, mark it "reported, not verified".
- Do not write marketing copy, fundraising decks, or pricing. Not your job
  right now; Sprint 3 handles commerce.
- Do not relitigate the Paperclip architecture decisions from the Apr 21
  setup memory — hosting, trusted zones, budget split are already locked.

## Stop conditions (hitting any of these is a success, not a failure)

- Budget for this task exceeds **$5** — stop at a clean checkpoint, commit what
  you have, leave a comment describing what's left.
- You've read more than **20 files** without converging — the task is too
  fuzzy; release it and say so.
- You find a ship-blocking bug in `src/` — log it as a GitHub issue tagged
  `bug`, do NOT fix it, and continue with the rest of the bootstrap.
- You find that Sprint 2 is materially **behind** the status docs' claims —
  stop everything else, write that up as the whole memo, tag Darin on the PR,
  and release the remaining deliverables for a follow-up task.
- Three consecutive heartbeats pass with no file changes — the orchestrator
  will pause you automatically; when Darin wakes you, explain why.

## Definition of Done checklist

- [ ] `docs/ai-notes/ceo-week-1-memo.md` committed, ≤2 pages
- [ ] `paperclip/agents/doc-keeper.yaml` committed, matches setup guide §6.1
- [ ] Exactly 3 files under `paperclip/tasks/doc-*.md`, each scoped to `docs/**`
- [ ] `docs/ai-notes/ceo-week-1-plan.md` committed
- [ ] `docs/ai-notes/hiring-log.md` created or appended with today's entry
- [ ] Branch `paperclip/pr/ceo-01-bootstrap` pushed
- [ ] PR opened against `main`, auto-merge **off**, assigned to @darinlevesque
- [ ] PR description: one paragraph on *what*, one on *why*, one bullet list of
      things you noticed but chose not to address, one line on budget spent
- [ ] Total diff under 600 lines and under 6 files touched
- [ ] No edits outside the allowed_paths in `paperclip/agents/ceo.yaml`

## Handoff

When the PR is approved and merged, your *next* task will be
`ceo-02-observe-doc-keeper` — watching doc-keeper's first five auto-merges and
writing a one-page report on whether the phase-2 gate (hire test-writer) is
ready to open. Do not start that work now; wait for the merge.
