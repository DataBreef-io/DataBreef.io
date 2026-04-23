---
Version: 1.0.0
Created: 2026-04-22
Status: Design — activates on launch day (May 18, 2026)
Owner: Darin Levesque
---

# Continuous Improvement Framework

Once DataBreef is live, every product decision should trace back to a documented signal from a real user. This document defines **how we collect**, **how we triage**, **how we decide**, and **how we close the loop** — so the backlog stops being opinion-driven and becomes evidence-driven.

## 1. Principles

1. **Capture everything; filter later.** Low-effort capture channels (in-app widget, email, social) beat high-effort ones (formal surveys) when trying to catch early signal. We collect first, judge second.
2. **Tag at the source.** A raw quote without a tag is almost useless later. Every captured item gets at least one tag on the way in.
3. **Close the loop visibly.** The person who reported a pain point sees acknowledgment within 24 hours and an outcome within two weeks, even if the outcome is "not doing this, here's why."
4. **One backlog, many inputs.** Feedback, bugs, and internal ideas all flow into the same queue and compete on the same rubric. No parallel "wishlist" that nobody reads.
5. **Bias toward retention.** When prioritizing, a pain point from a paying, active user outweighs a feature request from a free trial. We can quantify this.

## 2. Capture Channels

| Channel | Tool | Who | Captures |
|---|---|---|---|
| In-app feedback widget | Custom (textarea + optional screenshot) in `/settings` sidebar | Logged-in users | Pain points, feature requests, confusions |
| Support email | `support@databreef.io` → Plain (or Front) | Anyone | Bugs, billing issues, general questions |
| Public Dib comments | Comments on `/dib/<slug>` pages | Anyone | Reactions to the surfaced Dib product itself |
| Churn exit survey | Triggered on subscription cancel | Cancelling users | Why they left |
| NPS micro-survey | In-app at day 7, day 30, day 90 | Logged-in users | Sentiment trend |
| Social mentions | Plausible + manual monitoring of X / LinkedIn / Product Hunt / HN | Marketing | Public reactions |
| Onboarding drop-off | Funnel events (Plausible goals) | Automatic | "Where do people give up" |
| Status page subscribers | Better Stack | Users who opted in | Reliability signal |

Every channel flows into a single store: a **Feedback** table in our own database (NOT a spreadsheet — spreadsheets rot). Each row:

```
id | source | user_id (nullable) | plan (snapshot at capture) | text | screenshot_url | tags[] | severity | status | created_at | first_response_at | decision | decision_at | closed_at
```

The in-app widget writes directly. Email gets forwarded into the table via a daily sync job (simple IMAP → DB). Manual items get entered by whoever sees them — **zero friction** is the rule; if logging a quote takes more than 30 seconds, people stop doing it.

## 3. Tagging Taxonomy

Every captured item gets at least one type tag and one theme tag:

### Type tags (pick exactly one)

- `bug` — Something is broken vs. what the product promises.
- `pain-point` — The product works as designed, but the design hurts.
- `feature-request` — A net-new capability that doesn't exist.
- `question` — User needs information, not a change.
- `praise` — Positive signal (still valuable; informs what to keep).

### Theme tags (pick one or more)

- `auth` · `onboarding` · `anchoring` · `diving` · `surfacing` · `sharing-dibs`
- `billing` · `account-settings` · `team-collab`
- `reliability` · `performance` · `security`
- `adapter:postgres` · `adapter:mysql` · `adapter:mssql` · `adapter:snowflake` · `adapter:oracle` · `adapter:mongodb`
- `docs` · `pricing`
- `integrations` · `api`

Tags are editable — a wrong tag at capture time can be fixed during triage.

### Severity (for bugs + pain points only)

- `sev1` — Blocks paying users from core value. Page Darin immediately.
- `sev2` — Works around exists, but workaround is bad. Fix within a sprint.
- `sev3` — Minor friction; queue for a future sprint.
- `sev4` — Cosmetic.

## 4. Triage Cadence

**Daily** (first 15 minutes of Darin's morning):
- Skim new items since yesterday.
- Acknowledge every named user ("Got it, we'll follow up by Friday") — one-line reply, no SLA pretense.
- Flag any `sev1` and work it immediately.
- Tag anything that came in untagged.

**Weekly** (every Monday, 30 minutes):
- Review all items with `status = new` from the past 7 days.
- Cluster into themes (the tag taxonomy does most of this automatically).
- For each cluster, decide: **now** (this sprint), **next** (queue for the next sprint-planning intake), **later** (backlog), or **no** (write down why, send the requester a short note).
- Update `status` accordingly.

**Bi-weekly** (first day of each sprint, 1 hour):
- The sprint-planning intake: look at the `next` bucket plus any roadmap commitments plus any hygiene work.
- Apply the RICE-lite scoring (see §5).
- Commit the top N items that fit the sprint budget.
- Move everything not committed back to `later` with a note.

**Monthly** (first Friday of each month, 1 hour):
- Zoom out: look at what themes dominated the month.
- Do any metrics (churn, NPS, feature adoption) contradict what feedback said?
- Update `roadmap-refined-*.md` if the story has shifted meaningfully.

## 5. Prioritization Rubric (RICE-lite)

For each candidate item, score four dimensions 1-5:

- **R — Reach**: how many users hit this? (1 = rare, 5 = nearly everyone)
- **I — Impact**: how much does fixing it help each affected user? (1 = nice, 5 = unblocks core value)
- **C — Confidence**: how sure are we about R and I? (1 = guess, 5 = multiple independent signals)
- **E — Effort**: how long will it take? (1 = months, 5 = hours) — inverted so high is good.

**Score = R × I × C × E**. Highest score wins slots in the sprint.

**Override rule**: any `sev1` bug or any item from a churned-or-churning Current/Gulfstream customer jumps the queue regardless of score. This is deliberate — we protect retention revenue before we chase new.

## 6. Closing the Loop

Every item has a terminal state:

- **Shipped** — Done. Reply to the reporter naming the release date and thanking them specifically.
- **Wontdo** — Not doing it. Reply with the reasoning (2-3 sentences, honest). This is harder than shipping but builds more trust.
- **Dupe** — Merged into another item. Link the two.
- **Stale** — Item never got enough support after 90 days in `later`. Auto-close with a note that reopening requires a new data point.

Every month we publish a short `/changelog` entry listing shipped items — sourced directly from the `Shipped` column. This doubles as marketing (visible progress) and as closure (users see their words turn into code).

## 7. Metrics That Track the Framework Itself

Six numbers, reviewed monthly:

| Metric | Target | Why |
|---|---|---|
| Time to first response on in-app feedback | < 24h p95 | The promise we make in §4 daily cadence |
| Time to decision on triaged items | < 14 days p95 | No items rot in `new` |
| % items closed with reporter notification | > 90% | Loop-closing discipline |
| NPS delta month-over-month | trending up | Lagging validation signal |
| Feature-request → shipped ratio | ≥ 10% of requests shipped quarterly | Proves the system moves |
| Churn reason clusters | Shrinking top-3 | Proves we're fixing the right things |

A dashboard at `/internal/feedback-ops` renders these from the Feedback table — build this in Sprint 6.

## 8. What This Replaces

After launch, **this framework replaces the sprint-* docs as the primary driver of what we build**. The refined roadmap (`roadmap-refined-april-22.md` Part 5) becomes a list of candidates; the feedback framework decides which candidates are actually worth building.

Pre-launch planning is top-down because there are no customers yet. Post-launch planning is bottom-up because there are.

## 9. Implementation Checklist (build during Sprint 5, May 19 – Jun 1)

- [ ] `Feedback` table migration.
- [ ] In-app feedback widget component + route handler.
- [ ] Email → table sync job (IMAP poll, daily).
- [ ] Triage UI at `/internal/feedback` (Darin-only, behind `role = admin` check).
- [ ] Monday/biweekly/monthly calendar blocks on Darin's calendar.
- [ ] `/changelog` page renders from `Shipped` items.
- [ ] `/internal/feedback-ops` dashboard (Sprint 6 target).

---

## Change Log

- **2026-04-22** — v1.0.0 — Initial framework design. Activates on launch day (May 18, 2026). (Claude, scheduled task)
