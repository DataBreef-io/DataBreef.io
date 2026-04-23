# DataBreef Mission

## Mission

DataBreef exists to end the silence between databases and the people who depend on them.

Most databases are black boxes to everyone except the engineer who built them — and often, after six months, even that engineer has forgotten what lives inside. DBAs drown in dashboards that show everything and explain nothing. Founders, product leads, and operators stare at dashboards that explain something, but rarely the thing they needed to know. Meanwhile the truth — the table quietly approaching an integer overflow, the index bleeding latency, the cohort slowly churning, the cost about to spike — sits inside the data, unread.

We build the bridge. DataBreef anchors to a reef, dives deep into what is actually there, and surfaces a Data Intelligence Brief — a Dib — that speaks to both a DBA and a decision-maker in the same breath. Never a data dump. Always a diagnosis, a prognosis, and a next move. Always grounded in what the database actually says — never guessed, never invented. Read-only by construction, because the first thing we earn from every customer is their trust, and trust is the one thing a read-write tool can never fully have.

## What world-class looks like

A DBA reads a Dib and says, "I didn't know that." A CEO reads the same Dib and says, "and here's what we're going to do about it." If both are true, we shipped.

## North-star goals

1. **Every Dib passes the "both audiences" test.** A DBA finds real technical depth. A decision-maker finds a clear business implication. One brief, two satisfied readers.
2. **Every insight is diagnostic, prognostic, and prescriptive.** It names what is true, what it is becoming, and what to do about it.
3. **Security is visible, not hidden.** Every Dive shows the user — live, in the audit log — the read-only enforcement commands executed against their database. Trust is a product feature.
4. **From Anchor to first Dib: under 60 seconds with real insight, not a placeholder.** The pipeline is fast enough to feel honest.
5. **Dibs earn a permanent seat in the weekly routine of both audiences.** They are worth returning to, worth sharing, and worth acting on.

## Operating principles

Use these when two choices compete:

- **Insight over comprehensiveness.** Five deep observations beat fifty shallow ones.
- **Actionability over pedantry.** A usable 95%-confident insight beats a flawless one the user cannot apply.
- **Translation is the product.** A feature that sharpens the tool for DBAs but blurs it for decision-makers — or vice versa — is net negative. Both audiences, always.
- **Read-only is the floor, not the ceiling.** Never weaken the read-only guard to unlock a feature. If the insight needs write access, it doesn't ship.
- **The database is the source of truth. The model is not.** If the Dive didn't return it, the Dib doesn't mention it.
- **Oceanic vocabulary is not decoration.** Reef, Anchor, Dive, Surface, Dib — the words encode how we think. Use them consistently, in product and in code.
- **Respect the reader's time.** A Dib is not a report. A Dib is the insight that saves the reader from having to read one.

## The bar

When an agent is about to write a line of code, a test, a doc, or a commit message, the question is not "does this work?" The question is: "does this make the next Dib truer, clearer, faster to trust, or easier to act on?" If yes, ship it. If no, set it down and pick up something that does.
