---
version: 2.0
name: frugal-design-system
description: Frugal's visual design system — dark-first glassmorphism SaaS built on deep indigo-navy surfaces, #FF500B brand orange, ambient mesh orb backgrounds, frosted-glass panels, and spring-curve entrance animations. Primary reference for all UI decisions and Stitch screen generation.

colors:
  primary: "#FF500B"
  primary-foreground: "#FFFFFF"
  ring: "#FF500B"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0.008 326)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0.008 326)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0.008 326)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.96 0.003 325.6)"
  muted-foreground: "oklch(0.542 0.034 322.5)"
  accent: "oklch(0.96 0.003 325.6)"
  accent-foreground: "oklch(0.212 0.019 322.12)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0.005 325.62)"
  input: "oklch(0.922 0.005 325.62)"

dark-colors:
  background: "oklch(0.06 0.025 270)"
  foreground: "oklch(0.97 0 0)"
  card: "oklch(0.10 0.025 268)"
  card-foreground: "oklch(0.97 0 0)"
  popover: "oklch(0.10 0.025 268)"
  popover-foreground: "oklch(0.97 0 0)"
  primary: "#FF500B"
  primary-foreground: "#FFFFFF"
  secondary: "oklch(0.14 0.025 268)"
  secondary-foreground: "oklch(0.97 0 0)"
  muted: "oklch(0.13 0.025 268)"
  muted-foreground: "oklch(0.56 0.05 268)"
  accent: "oklch(0.13 0.025 268)"
  accent-foreground: "oklch(0.97 0 0)"
  destructive: "oklch(0.65 0.22 25)"
  border: "oklch(1 0 0 / 0.08)"
  input: "oklch(1 0 0 / 0.10)"
  ring: "#FF500B"

chart-colors:
  chart-1: "#FF500B"
  chart-2: "oklch(0.65 0.27 288)"
  chart-3: "oklch(0.55 0.28 288)"
  chart-4: "oklch(0.45 0.26 285)"
  chart-5: "oklch(0.38 0.22 283)"

radius:
  base: 0.5rem
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.5)"
  2xl: "calc(var(--radius) * 2)"
  3xl: "calc(var(--radius) * 2.6)"
  4xl: "calc(var(--radius) * 3.2)"

fonts:
  sans: Inter
  serif: "Instrument Serif"
  playwrite: "Playwrite IN"
  playfair: "Playfair Display"
  ethnocentric: Ethnocentric
  nasalization: Nasalization
---

# Design System: Frugal

## 1. Visual Theme & Atmosphere

Frugal is a monitoring console with a soul — a dark-first SaaS dashboard that communicates the weight of money through restraint, not alarm. The atmosphere sits at the intersection of deep-space calm and technical precision: deep indigo-navy (`oklch(0.06 0.025 270)`) as the canvas, frosted glass panels floating above it, and a single aggressive orange (`#FF500B`) as the lone warm signal.

The design philosophy is **calm urgency** — money is at stake, but panic UI is banned. Think: a well-lit control room at 2am after a deploy, where a developer needs to know "am I OK?" within five seconds of landing on the page.

Three ideas are locked and non-negotiable:

1. **Deep indigo-navy space** — the canvas is always dark, always cool, always controlled
2. **Frosted glass panels** — every elevated surface blurs through to the ambient orb background beneath it
3. **One orange** — `#FF500B` appears once per viewport as the sole interactive signal; never competing, never decorating

**Atmosphere calibration:**
- Density: 6 / 10 — data-rich but breathable; not a cockpit
- Variance: 6 / 10 — confident offset layouts, asymmetric section breaks, not chaotic
- Motion: 5 / 10 — spring-physics entrances, ambient drift, no cinematic theatrics
- Creativity: 8 / 10 — distinctive SaaS personality, not a generic dashboard clone

Marketing and landing surfaces carry three slowly drifting ambient orbs — two indigo-blue, one barely-there warm red — behind all frosted cards. Dashboard surfaces keep the same glass language but remove orb drama for focus. Every brand touchpoint holds the same tension: cold dark space, one warm orange signal, frosted glass between.

---

## 2. Color Palette & Roles

### Core Surfaces (Dark Mode — Primary Personality)

- **Deep Navy Canvas** (`oklch(0.06 0.025 270)` ≈ `#07060F`) — Page background, the unifying void behind all glass panels. Every screen begins here.
- **Glass Panel Base** (`oklch(0.10 0.025 268)` ≈ `#0D0C17`) — Card and elevated surface fill. Combined with `backdrop-filter: blur(24px)` and a translucent white gradient overlay, this becomes a frosted glass surface.
- **Secondary Surface** (`oklch(0.14 0.025 268)` ≈ `#131220`) — Sidebar chips, secondary panels, nested containers.
- **Muted Surface** (`oklch(0.13 0.025 268)` ≈ `#111020`) — De-emphasized blocks, badge backgrounds, table row alternates.
- **Hairline Border** (`oklch(1 0 0 / 0.08)` = white at 8% alpha) — Panel edges in dark mode. Extremely subtle. Catches light without shouting.
- **Form Input** (`oklch(1 0 0 / 0.10)` = white at 10% alpha) — Input field backgrounds. Slightly brighter than borders so fields are distinguishable.

### Text

- **Primary Text** (`oklch(0.97 0 0)` ≈ `#F7F7F7`) — All body copy, headings, and UI labels on dark surfaces. Near-white, never pure white — prevents harshness.
- **Muted Text** (`oklch(0.56 0.05 268)` ≈ `#7878A8`) — Metadata, secondary labels, timestamps, subdued descriptions. The indigo tint keeps it on-palette, not grey.

### Accent

- **Brand Orange** (`#FF500B`) — The sole interactive accent color. Used for: primary CTA buttons, focus rings, `gradient-text` hero headings, chart series 1, footer link underlines, and subtle glow bloom effects. **One orange element per viewport.** Never used as a surface fill or background pattern.
- **On Orange** (`#FFFFFF`) — Text and icons sitting directly on orange surfaces.
- **Gradient Orange** — Three-stop linear gradient at 135°: `#FF7733 → #FF500B → #CC4008`. Applied exclusively to hero headings via the `.gradient-text` utility. Not a surface fill.

### Feedback & Data

- **Destructive Red** (`oklch(0.65 0.22 25)` ≈ `#E04A2A`) — Error states, budget breach warnings. Same hue family as orange; intentional.
- **Chart Palette** — Sequential five-stop scale from orange into deep indigo-blue. Designed exclusively for data visualization; never use these as UI accent colors:
  - Chart 1: `#FF500B` (orange — primary series)
  - Chart 2: `oklch(0.65 0.27 288)` (blue)
  - Chart 3: `oklch(0.55 0.28 288)` (blue-mid)
  - Chart 4: `oklch(0.45 0.26 285)` (deep blue)
  - Chart 5: `oklch(0.38 0.22 283)` (navy)

### Light Mode (Secondary — User Preference)

- **Pure White Canvas** (`oklch(1 0 0)`) — Light mode background
- **Near-Black Text** (`oklch(0.145 0.008 326)`) — Primary text in light mode
- **Off-White Card** (`oklch(1 0 0)`) — Card surfaces (same as background; differentiated by shadow)
- **Light Border** (`oklch(0.922 0.005 325.62)`) — Structural lines and input borders

**Palette constraint:** No warm/cool gray fluctuation. Stick to the indigo-tinted neutrals (`oklch hue ~268–270`) throughout dark mode. Never mix zinc and slate grays.

---

## 3. Typography Rules

### Font Families

| Role | Font | Notes |
|------|------|-------|
| **All functional UI** | Inter | Navigation, buttons, labels, body, forms, metadata, dashboard tables — every UI element |
| **Wordmark only** | Ethnocentric | The "FRUGAL" brand mark. Treat as a logo glyph, not a typeface. Never use for headings or body copy |
| **Editorial marketing moments** | Instrument Serif | Italic variant for elegance — pull quotes, marketing subheadings where warmth is intentional. Never in app UI |
| **High-fashion editorial** | Playfair Display | Reserved for specific marketing sections only — never dashboard or functional UI |
| **Sci-fi tech labels** | Nasalization | Decorative only — technical accent in marketing. Never functional |

### Hierarchy Principles

- Inter handles everything functional. One font rules all UI — no decorative font bleeding into navigation, forms, dashboards, or tables.
- Hierarchy is expressed through weight contrast (400 vs 700/800) and color (primary vs muted), not massive size jumps.
- Hero headings scale fluidly using `clamp()` or Tailwind's responsive scale: `text-4xl md:text-6xl lg:text-8xl`.
- Body text maximum line length: 65 characters (`max-w-prose` or explicit `max-w-[65ch]`).
- Gradient text (`#FF7733 → #FF500B → #CC4008` at 135°) only on `<h1>` or `<h2>` at display scale — minimum 32px, one gradient heading per hero section, never on body or subheadings.
- Dashboard surfaces: weight contrast and muted-foreground color do all the work. No decorative typography.

### Dashboard / Data Typography Specifics

- All numbers displaying spend, burn rate, or usage data use monospace or tabular numerals (Inter with `font-variant-numeric: tabular-nums`) so columns align.
- Metadata and timestamps: `text-xs` or `text-sm`, `--muted-foreground` color.
- Table cells: `text-sm`, regular weight, no condensed tracking.

---

## 4. Hero Section

The hero must answer "what is this and why do I need it?" in under five seconds for a developer who just got burned by a surprise AI bill.

- **Tone:** Technical-peer voice. Not a marketer. Not a startup pitch. A competent colleague saying "here's the alarm system you should have had."
- **Structure:** Left-aligned or asymmetric split. Centered hero is BANNED. Confidence reads as asymmetry.
- **Headline:** Large, left-aligned, gradient-text applied to the line that carries the product's core promise. Bold weight (700–800). No overlapping with any other element.
- **Subheadline:** `text-lg` or `text-xl`, Inter regular, `--muted-foreground` color. Two lines maximum. Specific, honest — never vague claims.
- **CTA:** One primary CTA button. Orange fill (`#FF500B`), white text, pill-shaped (`rounded-full`), `px-6 py-3`. Subtle orange glow bloom on hover (`box-shadow: 0 0 20px #FF500B40`). No secondary "Learn more" link beneath it.
- **Background:** Mesh orbs active. Glass panel floating alongside or behind headline — never overlapping text.
- **Honesty constraint:** No fake metrics, no invented uptime percentages, no placeholder statistics. If real data is not available, use `[metric]` placeholder, not fabricated numbers.

---

## 5. Glassmorphism System

The core visual language. Every elevated surface uses the glass panel treatment.

### Base Glass Panel

```css
.glass-panel {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.1) 0%, oklch(1 0 0 / 0.03) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid oklch(1 0 0 / 0.12);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}
```

**Dark mode variant:**
```css
.dark .glass-panel {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.05) 0%, oklch(1 0 0 / 0.01) 100%);
  border: 1px solid oklch(1 0 0 / 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

**Hover state:** Border brightens to `oklch(1 0 0 / 0.15)`, fill becomes slightly more opaque, shadow deepens to `rgba(0,0,0,0.6)`. The panel "rises" toward the user.

**Glass works only when there is visual content behind the panel.** The ambient mesh background (three orbs) is mandatory for `backdrop-filter` to have material to blur. Against a plain dark background with no orbs, the effect is invisible.

### Ambient Mesh Background

Three floating orbs, `position: fixed; z-index: -1`, drifting with a 20-second float animation. Must be present at layout root — never per-page, never inside a scrollable container.

| Orb | Size | Position | Color | Role |
|-----|------|----------|-------|------|
| Orb 1 | 60vw × 60vh | Top-left | `oklch(0.62 0.27 288 / 0.15)` indigo | Dominant cool glow |
| Orb 2 | 50vw × 50vh | Bottom-right | `oklch(0.55 0.28 288 / 0.10)` indigo | Cool counterbalance |
| Orb 3 | 40vw × 40vh | Center-offset | `oklch(0.65 0.22 25 / 0.08)` warm red | Barely-visible warmth |

Each orb is a circle with `filter: blur(80px)`. The staggered animation delays (-5s, -10s) keep all three permanently out of phase — continuous organic drift without rhythm.

---

## 6. Component Stylings

### Buttons

**Primary CTA:** Orange fill (`#FF500B`), white text, `rounded-full`, `px-6 py-3`, medium weight. Active state: `-1px translateY` for tactile push feedback. Hover: subtle orange glow bloom (`box-shadow: 0 0 20px #FF500B40`). No outer neon rings. No custom cursors.

**Secondary / Ghost:** Transparent background, `border: 1px solid oklch(1 0 0 / 0.15)` in dark mode, white text. Same pill shape. Hover: border brightens to `oklch(1 0 0 / 0.25)`.

**Destructive:** Red tinted (`oklch(0.65 0.22 25)`), used only for irreversible actions. Same shape and size as primary.

### Cards / Panels

Apply `.glass-panel` to all elevated surfaces in dark mode. Use `rounded-xl` (12px) for standard cards, `rounded-2xl` (16px) for feature and hero cards. Padding: `p-6` for standard panels, `p-8` for hero/feature panels.

Do NOT add decorative box-shadows beyond the built-in glass shadow — they fight the frosted effect. Glass provides its own depth.

For high-density data areas (tables, metric grids): replace glass cards with `border-top: 1px solid oklch(1 0 0 / 0.08)` dividers and negative space separation.

### Data & Metric Display

Stat cards showing spend, burn rate, or budget status: large monospace number (`text-3xl` or `text-4xl`, `font-bold`, tabular-nums), label beneath in `text-sm` muted-foreground. Status indicator left-aligned inline with the number — orange for warning, destructive-red for breach, no color for nominal.

Charts: Recharts or similar. Use the five-stop chart palette. Dark background, no chart area fill, smooth line curves. Grid lines at `oklch(1 0 0 / 0.05)` — barely visible structural guides.

### Inputs / Forms

Label above the input, `text-sm` weight 500, `--foreground` color. Input background: `oklch(1 0 0 / 0.10)` in dark mode. Focus ring: `#FF500B` with 2px offset. Error text below the input in destructive red, `text-sm`. No floating labels. Helper text optional, below input in muted-foreground.

API key inputs: monospace font, hidden by default, reveal on explicit action. Always label with encryption status inline, not in a FAQ.

### Navigation / Sidebar

Dark sidebar with `oklch(0.10 0.025 268)` background. Active item: orange left border (`2px solid #FF500B`), slightly brighter background tint. Inactive: muted-foreground label. Hover: full-foreground label, no background tint change. No gradient backgrounds on nav items.

### Loading States

Skeletal shimmer loaders matching exact layout dimensions — not generic circular spinners. Shimmer uses `oklch(1 0 0 / 0.05)` → `oklch(1 0 0 / 0.10)` gradient animation at 1.5s. Match the shape of the content being loaded precisely.

### Empty States

Composed illustrations or icons indicating how to populate the data — not bare "No data" text. Show a clear call-to-action for first-step (connect a provider, set a budget). Use Instrument Serif italic for the empty state message in marketing contexts; Inter for dashboard empty states.

### Alerts / Status Banners

Inline, not modal. Budget warning: orange-tinted glass panel, `#FF500B` left border, orange icon. Budget breach: destructive-red tinted panel. Nominal: no status panel at all — absence of alarm is the signal everything is fine.

---

## 7. Layout Principles

Frugal's layout communicates control. Every element occupies its own clean spatial zone — no overlapping, no absolute-positioned content stacking on other content.

### Grid Architecture

- CSS Grid for all multi-column layouts. No `calc()` percentage hacks with Flexbox.
- Max content width: `max-w-7xl mx-auto` for full-width marketing sections, `max-w-4xl` for centered content blocks.
- Marketing sections: `py-24` or `py-32` vertical breathing room. Dashboard panels: `p-6` or `p-8`.
- Card grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for standard feature grids. Feature showcases use asymmetric 2-column zig-zag or 60/40 splits — not three equal columns.

### Dashboard Layout

Five-second answer requirement: the first visible screenful must immediately show current spend, burn rate, and any active alerts — without scroll. Hierarchy: big number first, trend second, provider breakdown third.

Z-layering: `mesh-bg` at `z-index: -1` → page content at `z-index: 0+` → sticky header at `z-index: 10` → modals/overlays at `z-index: 50+`.

### Responsive Collapse

All multi-column layouts collapse to single column below `768px`. No horizontal scroll — horizontal overflow on mobile is a critical failure. Section gap reduces proportionally: `clamp(3rem, 8vw, 6rem)`. Headlines scale via `clamp()`. All interactive elements minimum `44px` tap target.

Full-height sections use `min-h-[100dvh]` — never `h-screen` (iOS Safari viewport jump).

### Orange Scarcity Rule

One primary orange element per visible viewport at any scroll position. One gradient-text heading, or one orange CTA button, or one prominent orange accent — not multiple competing. The scarcity is what gives orange its signal weight.

---

## 8. Motion & Interaction

### Spring Physics

All entrance animations use `cubic-bezier(0.16, 1, 0.3, 1)` — fast approach, slight overshoot, physical "snap into place" feel. No linear easing. No ease-in-out on content reveals.

Default spring feel: `stiffness: 100, damping: 20`. Weighty and deliberate, not bouncy.

### Entrance Animation Classes

| Class | Behavior | Duration | Use Case |
|-------|----------|----------|----------|
| `.animate-fade-in-up` | `translateY(24px) → 0` + `opacity 0 → 1` | 0.9s | Cards, sections, lists — primary workhorse |
| `.animate-fade-in-scale` | `scale(0.96) + translateY(12px) → 0` + `opacity 0 → 1` | 1s | Modals, hero elements, prominent cards |
| `.animate-grow-up` | `scaleY(0 → 1)` from `transform-origin: bottom` | 1.2s | Bar chart bars, vertical progress reveals |
| `.animate-float-in` | `translateY(30px) + rotate(4deg) → 0` + `opacity 0 → 1` | 1s | Decorative floating mockup cards |

All use `animation-fill-mode: forwards`. Elements are `opacity: 0` before animation fires.

### Staggered Cascade

Never mount lists instantly. Sibling stagger at `0.1s` increments:
```html
<div class="animate-fade-in-up" style="animation-delay: 0s">...</div>
<div class="animate-fade-in-up" style="animation-delay: 0.1s">...</div>
<div class="animate-fade-in-up" style="animation-delay: 0.2s">...</div>
```

### Ambient Loops

The three mesh orbs drift permanently at `20s ease-in-out alternate infinite`. Staggered `-5s` and `-10s` delays keep them always out of phase — continuous organic motion without rhythm.

Marquee logo strip: `28s linear infinite`, translates by exactly `-50%` (content duplicated). Hover pauses. `will-change: transform` for GPU compositing.

Footer links: three-way hover state — text brightens to near-white, `translateX(4px)` rightward pull, orange underline sweeps from left using spring easing.

### Performance Rules

Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, or `height`. Grain/noise texture filters on fixed pseudo-elements only — never on animated elements. `prefers-reduced-motion` disables all animations; elements render at final state immediately.

---

## 9. Anti-Patterns — Banned

These are the tells. Violating these breaks the design's credibility.

**Visual:**
- No pure black (`#000000`) anywhere — use Deep Navy Canvas or Charcoal equivalents
- No neon outer glows on any UI element — the single orange glow bloom on hover CTA is the maximum
- No purple, teal, or cyan accent colors — the indigo of the orbs is a background element, not an interactive accent
- No oversaturated accents — the chart palette's blue series is for data only, never UI accents
- No excessive gradient text — one `gradient-text` heading per section, never on subheadings or labels
- No `LABEL // YEAR` formatting — "METRICS // 2025" is lazy AI typography convention
- No three equal-width cards side by side — use asymmetric grid, 2-column zig-zag, or horizontal scroll

**Typography:**
- No decorative fonts (Ethnocentric, Nasalization, Playfair, Playwrite) in any dashboard or app UI surface
- No generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) anywhere in the product
- No fabricated display copy using AI marketing clichés: "Seamless", "Unleash", "Supercharge", "Next-Gen", "Elevate", "Effortless"
- No overlapping text over images or other text elements — clean spatial separation always

**Data & Content:**
- No fabricated metrics or statistics — never invent "99.98% uptime", "18.5k deploys", "124ms response time" or similar. Use `[metric]` placeholder if real data is unavailable
- No fake system-performance dashboard sections filled with invented numbers
- No generic placeholder names — not "John Doe", "Acme Corp", "ProjectX"
- No fake round numbers presented as real data (`99.99%`, `50%`, `1,000 users`)

**UX:**
- No custom mouse cursors
- No circular loading spinners — use skeletal loaders matching layout dimensions
- No "Scroll to explore" text, scroll arrows, or bouncing chevrons
- No silent "coming soon" toasts — every visible button works or is explicitly labeled as upcoming
- No centered Hero layouts — always left-aligned, asymmetric split, or offset composition
- No horizontal scroll on mobile viewports
- No `h-screen` — use `min-h-[100dvh]` for full-height sections
- No `overflow: hidden` on glass panel parents without testing — can break `backdrop-filter` in Safari
- No broken image links — use `picsum.photos` for placeholder images, SVG avatars for placeholder users

**Tone:**
- No fear-mongering copy ("your costs are EXPLODING!!") — calm urgency only
- No overpromising enforcement: "block" and "throttle" operate at the next 5-minute poll, not mid-flight. Copy must reflect this honestly

---

## 10. Technical Implementation Reference

### Glassmorphism Checklist

For correct glass rendering:
1. `.mesh-bg` + all three orbs present at layout root behind glass content
2. Panel element in normal document flow above mesh layer (`position: relative` or default)
3. `-webkit-backdrop-filter` prefix included alongside `backdrop-filter` (Safari)
4. Panel background uses `oklch(1 0 0 / low-alpha)` — not opaque
5. Parent container does NOT have `overflow: hidden` without careful testing

### CSS Custom Properties Quick Reference

```css
/* Dark mode key tokens */
--background: oklch(0.06 0.025 270);    /* #07060F — deep navy canvas */
--foreground: oklch(0.97 0 0);           /* #F7F7F7 — near-white text */
--card: oklch(0.10 0.025 268);           /* #0D0C17 — glass panel base */
--muted-foreground: oklch(0.56 0.05 268); /* #7878A8 — subdued text */
--border: oklch(1 0 0 / 0.08);           /* white 8% — hairline border */
--primary: #FF500B;                       /* brand orange */
--ring: #FF500B;                          /* focus ring */
--radius: 0.5rem;                         /* base radius: 8px */
```

### Breakpoints (Tailwind defaults)

- `sm: 640px` — small mobile breakpoint
- `md: 768px` — single-column collapse threshold
- `lg: 1024px` — full layout breakpoint
- `xl: 1280px` — wide layout
- `2xl: 1536px` — ultra-wide

Card grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`  
Hero text: `text-4xl md:text-6xl lg:text-8xl`  
Glass panel padding: `p-4 md:p-6 lg:p-8`  
Section gaps: `py-16 md:py-24 lg:py-32`
