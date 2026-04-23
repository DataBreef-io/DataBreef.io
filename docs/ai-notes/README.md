# AI Notes — Sprint Documentation

This directory contains all sprint planning, execution guides, and AI-generated planning documents for the DataBreef.io project.

**Purpose:** Single source of truth for sprint status, roadmaps, and daily guidance.

---

## 📋 Sprint Documentation Files

### Sprint 1 (Apr 16-26, 2026) — Foundation

| File | Purpose |
|------|---------|
| **sprint-1-completion.md** | What was accomplished: auth system, database schema, security setup |
| **sprint-1-debug.md** | Session persistence troubleshooting guide (step-by-step diagnosis) |

### Sprint 2 (Apr 19 – May 3, 2026) — Breadth & Hardening

| File | Purpose |
|------|---------|
| **EXECUTIVE-SUMMARY-SPRINT-2.md** | 📌 **FOR DARIN** — High-level status, blockers, action items, risk summary |
| **sprint-2-roadmap.md** | Detailed 14-day execution plan with daily breakdown, effort estimates, success criteria |
| **sprint-2-kickoff.md** | Executive summary: status, critical priorities, success metrics |
| **sprint-2-status-april-20.md** | **DAY 1 REPORT** — Blocker analysis, parallel work opportunities, updated confidence levels |
| **sprint-2-execution-notes.md** | **EXECUTION CLARITY** — Task dependencies, parallel work, contingency plans, decision log |
| **sprint-2-daily-guide.md** | Quick reference: today's actions, checklists, daily standup template |
| **sprint-2-tasks.md** | Original planning doc (archived reference — superseded by roadmap) |

---

## 🚀 How to Use This Directory

### For Planning
1. Read **sprint-2-roadmap.md** first (full 14-day plan)
2. Use **sprint-2-kickoff.md** for executive context
3. Refer to **sprint-2-tasks.md** for archived background

### For Execution
1. **START HERE**: Read **EXECUTIVE-SUMMARY-SPRINT-2.md** for high-level status, blockers, and action items
2. Check **sprint-2-daily-guide.md** each day for today's priority
3. Review **sprint-2-execution-notes.md** for task dependencies, parallel work opportunities, and contingency plans
4. Check **sprint-2-status-april-20.md** if blocked (what can we do instead?)
5. Reference **sprint-2-roadmap.md** for detailed task breakdown

### For Debugging
1. Use **sprint-1-debug.md** for Auth.js session issues
2. Cross-reference with **sprint-1-completion.md** for context

### For Unblocking
1. Check **sprint-2-execution-notes.md** § "Task Dependency Map" to find parallel work
2. Review "Risk Responses" section if blocked
3. Check "Descope Criteria" if slipping (what to cut, what to keep)

---

## 📌 File Naming Convention

**Rules:**
- Lowercase, kebab-case (e.g., `sprint-2-roadmap.md`)
- Prefix with sprint number (e.g., `sprint-2-`)
- Descriptive suffix (e.g., `daily-guide`, `kickoff`, `roadmap`)

**Why:**
- Consistent, easy to find
- Lowercase prevents confusion across systems
- Clear hierarchy (sprint # → document type)

---

## 🔄 Update Frequency

| Document | Updated | By |
|----------|---------|-----|
| sprint-2-daily-guide.md | After each day | Darin/Claude |
| sprint-2-roadmap.md | If scope changes | Darin + Claude (consensus) |
| sprint-2-kickoff.md | At sprint start | Claude |
| sprint-X-completion.md | At sprint end | Claude |
| sprint-X-debug.md | As issues arise | Claude |

---

## ✅ Consolidation Notes (Apr 18, 2026)

**Action taken:** Consolidated all Sprint 1 & 2 files from project root to `/docs/ai-notes/`.

**Before:**
```
/SPRINT_1_COMPLETE.md
/SPRINT_1_DEBUG.md
/SPRINT_2_TASKS.md
/SPRINT_2_ROADMAP.md
/SPRINT_2_DAILY_GUIDE.md
/docs/ai-notes/sprint-1-completion.md
```

**After:**
```
/docs/ai-notes/
  sprint-1-completion.md ✅
  sprint-1-debug.md ✅
  sprint-2-daily-guide.md ✅
  sprint-2-kickoff.md ✅
  sprint-2-roadmap.md ✅
  sprint-2-tasks.md ✅
```

Root-level sprint files **deleted** to prevent duplication and confusion.

---

## 📖 Other Important Documents

These files are in `/docs/` but not sprint-specific:

- **roadmap-mvp.md** — Full 4-sprint launch plan (strategic)
- **roadmap-data-sources.md** — Long-term adapter roadmap (post-MVP)
- **design-system.md** — Ocean metaphor, design tokens
- **site-architecture.md** — Tech stack, infrastructure decisions
- **ai-notes/progress.md** — High-level project progress tracker
- **ai-notes/decisions-log.md** — Architecture decision records (ADRs)
- **ai-notes/project-overview.md** — Agent quick-start guide

---

## 🎯 Quick Links

**Planning:**
- [4-Sprint MVP Roadmap](../roadmap-mvp.md) (May 18 launch strategy)
- [Sprint 2 Roadmap](./sprint-2-roadmap.md) (next 14 days)

**Reference:**
- [Design System](../design-system.md) (UI/UX)
- [Architecture](../site-architecture.md) (tech decisions)

**Decisions:**
- [ADR Log](./decisions-log.md) (why we chose X over Y)

---

## 📞 Questions?

- **About sprint execution:** Check sprint-2-daily-guide.md or sprint-2-roadmap.md
- **About architecture:** See docs/site-architecture.md
- **About decisions:** See docs/ai-notes/decisions-log.md
- **About launch timeline:** See docs/roadmap-mvp.md

---

**Last updated:** April 20, 2026  
**Status:** Sprint 2 Day 2 — Planning phase complete; execution blocked on session persistence test verdict (expected TODAY)  
**Confidence:** 85% on-time delivery (contingent on session persistence working)  
**Next Milestone:** May 3 sprint exit; May 18 public launch
