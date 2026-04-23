# DataBreef Design System
> Version 1.0.0 · Last updated: 2026-04-12

**"Your schema, surfaced."**

The DataBreef design system is built around a single extended metaphor: **the ocean reef**. Your database schema IS your reef — complex, interconnected, teeming with life and meaning. DataBreef is the instrument that lets you dive in and understand it. Every design decision reinforces calm, depth, clarity, and the quiet awe of exploring something vast.

---

## 1. Brand Philosophy

### The Reef Metaphor
| Interface Element | Metaphor |
|---|---|
| The app itself | A research submersible |
| The user's database | Their reef |
| A Dib (Data Intelligence Brief) | A field report from the deep |
| A data source connection | Dropping anchor |
| Schema tables | Coral formations |
| Relationships / foreign keys | Symbiotic bonds between species |
| Anomalies / outliers | Bioluminescent signals in the dark |

### Tone of Voice
- **Calm.** Never alarming. Even errors feel like gentle course corrections.
- **Curious.** DataBreef is an explorer, not an auditor.
- **Precise.** Briefs are authoritative, not verbose.
- **Warm.** The ocean is alive — so is data.

### Copy Conventions
- Prefer ocean vocabulary in UI copy: "Dive in", "Surface your data", "Your reef", "Depth", "Current", "Anchor a source"
- Avoid tech jargon: use "schema" (acceptable), not "DDL" or "metadata" in user-facing copy
- Always active voice, present tense in UI labels

---

## 2. Color System

All colors are defined as CSS custom properties on `:root`. Never hard-code hex/rgb values in components — always reference variables.

### Primary Palette (Ocean Depths)

```css
:root {
  /* ── Deep Zones (Backgrounds) ── */
  --color-abyss:        hsl(215, 45%, 7%);    /* Deepest dark — page background */
  --color-deep:         hsl(210, 50%, 11%);   /* Card / panel background */
  --color-reef:         hsl(200, 50%, 16%);   /* Elevated surface, modals */
  --color-current:      hsl(192, 45%, 22%);   /* Borders, dividers, input bg */

  /* ── Mid Zone (Interactive) ── */
  --color-surface:      hsl(180, 55%, 34%);   /* Links, icon fills */
  --color-foam:         hsl(172, 65%, 50%);   /* Primary accent — CTAs, highlights */
  --color-brine:        hsl(168, 70%, 72%);   /* Hover states, glow src */

  /* ── Kelp Forest (Success / Green) ── */
  --color-kelp-deep:    hsl(155, 55%, 20%);   /* Success bg */
  --color-kelp:         hsl(152, 55%, 38%);   /* Success default */
  --color-seagrass:     hsl(148, 50%, 58%);   /* Success light */

  /* ── Shore (Neutrals / Text) ── */
  --color-sand-dark:    hsl(220, 15%, 55%);   /* Muted / secondary text */
  --color-sand:         hsl(220, 10%, 75%);   /* Placeholder text */
  --color-shore:        hsl(215, 20%, 88%);   /* Body text on dark bg */
  --color-seafoam:      hsl(200, 30%, 96%);   /* Primary text on dark / page text */

  /* ── Status (Reef Alert System) ── */
  --color-coral:        hsl(16, 80%, 62%);    /* Warning */
  --color-coral-deep:   hsl(16, 70%, 45%);    /* Warning pressed/bg */
  --color-urchin:       hsl(350, 65%, 58%);   /* Error / Danger */
  --color-urchin-deep:  hsl(350, 60%, 38%);   /* Error bg */
  --color-biolum:       hsl(182, 90%, 58%);   /* Info / special highlight */
}
```

### Semantic Aliases

```css
:root {
  /* Backgrounds */
  --bg-page:            var(--color-abyss);
  --bg-card:            var(--color-deep);
  --bg-elevated:        var(--color-reef);
  --bg-input:           var(--color-current);

  /* Text */
  --text-primary:       var(--color-seafoam);
  --text-secondary:     var(--color-shore);
  --text-muted:         var(--color-sand-dark);
  --text-placeholder:   var(--color-sand);
  --text-accent:        var(--color-foam);
  --text-link:          var(--color-brine);

  /* Borders */
  --border-subtle:      var(--color-current);
  --border-default:     hsl(192, 40%, 28%);
  --border-accent:      var(--color-surface);

  /* Brand */
  --brand-primary:      var(--color-foam);
  --brand-secondary:    var(--color-brine);
  --brand-glow:         hsl(172, 65%, 50%, 0.35);
}
```

### Dark Mode First

DataBreef is **dark-mode first**. The ocean at depth is dark. Light mode support may be added in v2 as a "surface view" toggle.

---

## 3. Typography

All fonts loaded via `next/font/google` (app) or `@fontsource` (fallback).

### Font Stack

| Role | Family | Weight(s) | Usage |
|---|---|---|---|
| Display | Cormorant Garamond | 400, 600 | Hero headlines, taglines, pull quotes |
| UI / Headings | Outfit | 400, 500, 600, 700 | All UI text: nav, headings, labels |
| Body | Inter | 400, 500 | Paragraphs, descriptions, Dib content |
| Monospace | JetBrains Mono | 400, 500 | Schema names, SQL, column types, code |

```css
:root {
  --font-display:  'Cormorant Garamond', 'Georgia', serif;
  --font-heading:  'Outfit', 'Segoe UI', system-ui, sans-serif;
  --font-body:     'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono:     'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Type Scale (fluid — rem based)

```css
:root {
  --text-xs:    0.75rem;    /* 12px — labels, badges */
  --text-sm:    0.875rem;   /* 14px — secondary text */
  --text-base:  1rem;       /* 16px — body default */
  --text-lg:    1.125rem;   /* 18px — lead text */
  --text-xl:    1.25rem;    /* 20px — card titles */
  --text-2xl:   1.5rem;     /* 24px — section headers */
  --text-3xl:   1.875rem;   /* 30px — page titles */
  --text-4xl:   2.25rem;    /* 36px — hero sub-headline */
  --text-5xl:   3rem;       /* 48px — hero headline */
  --text-6xl:   3.75rem;    /* 60px — landing display */
  --text-display: clamp(3rem, 6vw, 5rem); /* Fluid display */
}
```

### Line Height & Letter Spacing

```css
:root {
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  --tracking-tight:  -0.025em;
  --tracking-normal: 0em;
  --tracking-wide:   0.05em;
  --tracking-widest: 0.15em;   /* eyebrow labels — "DATA SOURCES" */
}
```

### Eyebrow Pattern

Section labels use the eyebrow pattern: `Outfit 500, 11px, --tracking-widest, --color-foam, UPPERCASE`.

```css
.eyebrow {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-foam);
}
```

---

## 4. Spacing Scale

Base unit: `4px` (0.25rem). All spacing uses multiples.

```css
:root {
  --space-1:   0.25rem;   /*  4px */
  --space-2:   0.5rem;    /*  8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;      /* 128px */
}
```

---

## 5. Border Radius

Organic, but not bubbly. Think water-smoothed stone.

```css
:root {
  --radius-sm:   0.25rem;     /*  4px — inputs, small chips */
  --radius-md:   0.5rem;      /*  8px — buttons */
  --radius-lg:   0.75rem;     /* 12px — cards */
  --radius-xl:   1rem;        /* 16px — modals, large cards */
  --radius-2xl:  1.5rem;      /* 24px — hero sections, panels */
  --radius-full: 9999px;      /* pills, badges, avatar circles */
}
```

---

## 6. Shadow & Glow System

Shadows use teal-tinted darkness — light refracting through water.

```css
:root {
  --shadow-sm:
    0 1px 2px hsl(210, 50%, 5%, 0.4);

  --shadow-md:
    0 4px 12px hsl(210, 50%, 5%, 0.5),
    0 1px 3px hsl(210, 50%, 5%, 0.3);

  --shadow-lg:
    0 8px 32px hsl(210, 50%, 5%, 0.6),
    0 2px 8px hsl(210, 50%, 5%, 0.4);

  --shadow-xl:
    0 16px 64px hsl(210, 50%, 5%, 0.7),
    0 4px 16px hsl(210, 50%, 5%, 0.5);

  /* ── Glow effects (bioluminescent) ── */
  --glow-foam:
    0 0 20px hsl(172, 65%, 50%, 0.3),
    0 0 60px hsl(172, 65%, 50%, 0.15);

  --glow-biolum:
    0 0 16px hsl(182, 90%, 58%, 0.4),
    0 0 48px hsl(182, 90%, 58%, 0.2);

  /* ── Card ambient ── */
  --shadow-card:
    0 0 0 1px var(--border-subtle),
    0 4px 16px hsl(210, 50%, 5%, 0.5);

  --shadow-card-hover:
    0 0 0 1px var(--border-accent),
    0 8px 32px hsl(210, 50%, 5%, 0.6),
    0 0 24px hsl(172, 65%, 50%, 0.12);
}
```

---

## 7. Motion & Animation

Calm, unhurried — like water. Never jarring.

```css
:root {
  /* Durations */
  --duration-instant:  75ms;
  --duration-fast:     150ms;
  --duration-normal:   250ms;
  --duration-slow:     400ms;
  --duration-slower:   600ms;

  /* Easing — water physics inspired */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);     /* Main ease — fast in, slow settle */
  --ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);      /* Standard transitions */
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Subtle spring for badges/tooltips */
  --ease-wave:      cubic-bezier(0.45, 0.05, 0.55, 0.95); /* Slow oscillation */
}
```

### Animation Patterns

```css
/* Fade up — page/section entry */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Drift — subtle ambient float (hero elements) */
@keyframes drift {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

/* Pulse glow — loading states, active Dib indicators */
@keyframes pulse-glow {
  0%, 100% { box-shadow: var(--glow-foam); }
  50%       { box-shadow: none; }
}

/* Shimmer — skeleton loading */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Wave scan — Dib generation progress */
@keyframes wave-scan {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Motion Rules
- All interactive state changes: `--duration-fast` + `--ease-out-expo`
- Page section entry animations: `--duration-slow` + `--ease-out-expo`
- Ambient/decorative animations (drift, glow): `--duration-slower` + `--ease-wave`, `animation-iteration-count: infinite`
- Respect `prefers-reduced-motion`: wrap ambient animations in media query

---

## 8. Component Patterns

### Button

Three variants: `primary`, `secondary`, `ghost`.

```css
/* Base */
.btn {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-expo);
  border: 1px solid transparent;
  letter-spacing: var(--tracking-wide);
}

/* Primary — the foam CTA */
.btn-primary {
  background: var(--color-foam);
  color: var(--color-abyss);
  border-color: var(--color-foam);
}
.btn-primary:hover {
  background: var(--color-brine);
  border-color: var(--color-brine);
  box-shadow: var(--glow-foam);
}

/* Secondary — bordered ocean */
.btn-secondary {
  background: transparent;
  color: var(--color-foam);
  border-color: var(--color-surface);
}
.btn-secondary:hover {
  border-color: var(--color-foam);
  background: hsl(172, 65%, 50%, 0.08);
}

/* Ghost — subtle nav / utility */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--color-current);
}
```

### Card

```css
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-6);
  transition: box-shadow var(--duration-fast) var(--ease-out-expo);
}

.card:hover {
  box-shadow: var(--shadow-card-hover);
}
```

### Badge / Chip

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  border: 1px solid currentColor;
}

.badge-reef    { color: var(--color-foam);    background: hsl(172, 65%, 50%, 0.12); }
.badge-kelp    { color: var(--color-seagrass); background: hsl(148, 50%, 38%, 0.15); }
.badge-coral   { color: var(--color-coral);   background: hsl(16, 80%, 62%, 0.12); }
.badge-urchin  { color: var(--color-urchin);  background: hsl(350, 65%, 58%, 0.12); }
```

### Input

```css
.input {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  transition: border-color var(--duration-fast) var(--ease-out-expo),
              box-shadow var(--duration-fast) var(--ease-out-expo);
}
.input::placeholder { color: var(--text-placeholder); }
.input:focus {
  outline: none;
  border-color: var(--color-foam);
  box-shadow: 0 0 0 3px hsl(172, 65%, 50%, 0.2);
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-deep) 25%,
    var(--color-current) 50%,
    var(--color-deep) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

---

## 9. Layout System

### Breakpoints

```css
/* Mobile-first */
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1536px;
```

### App Shell Layout

```
┌──────────────────────────────────────────┐
│ Topbar (64px, --bg-deep, sticky)         │
├────────────┬─────────────────────────────┤
│ Sidebar    │ Main Content                │
│ (260px,    │                             │
│ --bg-deep) │  --bg-page background       │
│            │  max-width: 1200px          │
│            │  padding: --space-8         │
└────────────┴─────────────────────────────┘
```

### Marketing Layout

Full-width sections with constrained content:
- Max content width: `1180px`
- Section padding: `--space-24` vertical
- Hero: full-viewport height, centered

---

## 10. Icon System

Use **Lucide React** — clean, consistent, minimal. Icons should feel like sonar instruments.

Icon sizing convention:
```
xs:  12px — inline with text
sm:  16px — button icons, badges
md:  20px — default UI icons
lg:  24px — nav icons, section icons
xl:  32px — empty states, feature icons
2xl: 48px — hero/marketing icons
```

---

## 11. Ocean Vocabulary Map

Use these terms consistently in UI copy and code (`aria-label`, `placeholder`, page titles):

| Technical Term | Ocean Copy |
|---|---|
| Connect a database | "Anchor a source" |
| Data source / database | "Reef" or "Source" |
| Generate a Dib | "Surface a brief" / "Dive deeper" |
| Data Intelligence Brief | "Dib" (always) |
| Schema explorer | "Reef surveyor" |
| Dashboard | "Reef overview" |
| Loading / scanning | "Diving..." / "Scanning depths..." |
| No data yet | "Still waters — connect your first reef" |
| Error | "Signal lost" |
| Success | "Surfaced" |

---

## 12. Do's & Don'ts

### Do
- ✅ Use dark backgrounds exclusively for the app
- ✅ Use `--color-foam` for all primary CTAs
- ✅ Use eyebrow labels above section headings
- ✅ Use `JetBrains Mono` for ALL schema-related text (table names, column names, data types)
- ✅ Animate with `--ease-out-expo` — settle like water, not rubber
- ✅ Keep Dib cards scannable: eyebrow → title → 1 or 2 stat chips → short insight text

### Don't
- ❌ Use pure `#ffffff` or `#000000` anywhere — always use palette variables
- ❌ Use `border-radius` smaller than `--radius-sm` (4px) — no sharp corners
- ❌ Use red for anything other than errors/danger
- ❌ Use more than 3 levels of elevation in one view (abyss → deep → reef)
- ❌ Show raw SQL to users — translate schema objects to ocean vocabulary where possible
- ❌ Use font sizes below `--text-xs` (12px)
