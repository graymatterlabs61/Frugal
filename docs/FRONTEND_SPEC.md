# Frontend Specification Document — Frugal
**Version:** 1.0 | **Date:** 2026-06-19

> Primary source of truth for visual decisions. Derived from `DESIGN.md` + `frontend/app/globals.css`.

---

## 1. Design Philosophy

Frugal is a **dark-first glassmorphism SaaS** product. Three locked ideas:

1. **Deep indigo-navy space** — `oklch(0.06 0.025 270)` — the dominant canvas in dark mode
2. **Frosted glass panels** — float above the dark surface via `backdrop-filter: blur(24px)`
3. **Single aggressive orange** — `#FF500B` — the sole interactive accent color

Marketing surfaces are intentionally atmospheric: ambient mesh orbs pulse slowly behind frosted cards; content entrance-animates with spring curves. Dashboard carries the same glass panels but dials back the orb drama for usability.

**Tone:** Cold dark space + warm orange signal + frosted glass in between.

---

## 2. Color Palette

### Brand & Accent

| Token | Value | Usage |
|-------|-------|-------|
| Primary orange | `#FF500B` | CTAs, focus rings (`--ring`), chart-1, gradient text, footer underlines, logo mark |
| On-primary | `#FFFFFF` | Text/icons directly on orange surfaces |
| Gradient orange | `linear-gradient(135deg, #FF7733 0%, #FF500B 60%, #CC4008 100%)` | Hero headings via `.gradient-text`; not a surface fill |
| Gradient warm variant | `linear-gradient(135deg, #ff9a6b 0%, #FF500B 55%, #e04000 100%)` | `.gradient-text-warm` — secondary hero moments |

### Dark Mode (Primary Personality)

| CSS Variable | Value | Approx | Role |
|---|---|---|---|
| `--background` | `oklch(0.06 0.025 270)` | #07060F deep navy | Page canvas — behind all glass panels |
| `--card` | `oklch(0.10 0.025 268)` | #0D0C17 | Card surface — glass panels sit on this |
| `--popover` | `oklch(0.10 0.025 268)` | #0D0C17 | Dropdown/popover surface |
| `--secondary` | `oklch(0.14 0.025 268)` | #131220 | Secondary surface, sidebar chips |
| `--muted` | `oklch(0.13 0.025 268)` | #111020 | Muted surface, de-emphasized blocks |
| `--muted-foreground` | `oklch(0.56 0.05 268)` | #7878A8 | Subdued labels, metadata |
| `--accent` | `oklch(0.13 0.025 268)` | #111020 | Accent surface (same as muted in dark) |
| `--foreground` | `oklch(0.97 0 0)` | #F7F7F7 | Primary text on dark |
| `--border` | `oklch(1 0 0 / 0.08)` | white 8% | Panel hairline borders |
| `--input` | `oklch(1 0 0 / 0.10)` | white 10% | Form input backgrounds |
| `--destructive` | `oklch(0.65 0.22 25)` | #E04A2A | Error states |
| `--ring` | `#FF500B` | — | Focus ring |

### Light Mode

Light mode is fully functional but not the primary personality. Used for document pages or user preference.

| CSS Variable | Value | Role |
|---|---|---|
| `--background` | `oklch(1 0 0)` | Pure white canvas |
| `--foreground` | `oklch(0.145 0.008 326)` | Near-black text |
| `--card` | `oklch(1 0 0)` | White card surface |
| `--muted` | `oklch(0.96 0.003 325.6)` | Muted off-white |
| `--muted-foreground` | `oklch(0.542 0.034 322.5)` | Mid-grey text |
| `--border` | `oklch(0.922 0.005 325.62)` | Light grey border |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red error |

### Chart Color Palette

Five-stop sequential palette: orange → indigo-blue. Designed for dark backgrounds.

| Token | Value | Hue |
|-------|-------|-----|
| `--chart-1` | `#FF500B` | Orange (brand) |
| `--chart-2` | `oklch(0.65 0.27 288)` | Blue |
| `--chart-3` | `oklch(0.55 0.28 288)` | Blue-mid |
| `--chart-4` | `oklch(0.45 0.26 285)` | Deep blue |
| `--chart-5` | `oklch(0.38 0.22 283)` (light) / `oklch(0.35 0.22 283)` (dark) | Navy |

**Rule:** Chart colors 2–5 are reserved exclusively for data visualization. Never use as UI accent colors.

**One orange per viewport.** One primary CTA button, one gradient-text heading, or one orange accent. Multiple competing orange elements cancel each other.

---

## 3. Typography

### Font Families

| CSS Variable | Family | Source | Weight Range | Role |
|---|---|---|---|---|
| `--font-sans` (base) | Inter | Google Fonts CDN | 100–900 variable | All functional UI — body, labels, buttons, nav, forms, dashboards |
| `--font-serif` | Instrument Serif | Google Fonts CDN | 400 (+ italic) | Accent serif — marketing pull quotes, editorial moments |
| `--font-playfair` | Playfair Display | Local `/public/font/` | 100–900 variable | Editorial display — high-fashion marketing headlines only |
| `--font-playwrite` | Playwrite IN | Local `/public/font/` | 100–900 variable | Cursive accent — decorative only; never functional |
| `--font-ethnocentric` | Ethnocentric | Local `/public/font/` | 400 | Wordmark only — "FRUGAL" brand mark; treat as logo, not typeface |
| `--font-nasalization` | Nasalization | Local `/public/font/` | 400 | Technical/sci-fi labels — optional decorative in marketing |

**Font loading:** Inter + Instrument Serif via Google Fonts CDN (`@import url(...)`). All others via `@font-face` with `font-display: swap` from `/public/font/`.

### Type Hierarchy

| Role | Font | Size | Weight |
|------|------|------|--------|
| Brand wordmark | Ethnocentric | 20–32px | 400 |
| Hero h1 gradient | Inter + `.gradient-text` | 48–96px | 700–800 |
| Marketing h2 accent | Instrument Serif (italic) | 24–40px | 400 |
| Section heading | Inter | 36px / `text-4xl` | 700 |
| Card heading (h3) | Inter | 18px / `text-lg` | 600 |
| Body / UI text | Inter | 14px / `text-sm` | 400 |
| Muted labels / metadata | Inter | 12px / `text-xs` | 400 |
| Button text | Inter | 14px / `text-sm` | 500 |
| Mono / code snippets | `font-mono` (system) | 13px / `text-[13px]` | 400 |

### Typography Principles
- Inter handles everything functional. Never use decorative fonts in navigation, forms, dashboards, or tables.
- Ethnocentric is one-token — the FRUGAL wordmark.
- Gradient text works at display scale (≥48px). Never on body text or captions.
- Instrument Serif earns its place in marketing sections only. Never in app UI.
- Weight contrast (400 vs 700) does most heading hierarchy work.

---

## 4. Radius Scale

Base: `--radius: 0.5rem` (8px). All tokens derive from this.

| Token | Formula | Value (at base 8px) | Role |
|-------|---------|---------------------|------|
| `--radius-sm` | `calc(var(--radius) * 0.6)` | 4.8px | Small inputs, chips, icon badges |
| `--radius-md` | `calc(var(--radius) * 0.8)` | 6.4px | Form inputs, secondary cards |
| `--radius-lg` | `var(--radius)` | 8px | Standard cards, panels, dialogs |
| `--radius-xl` | `calc(var(--radius) * 1.5)` | 12px | Feature cards, prominent panels |
| `--radius-2xl` | `calc(var(--radius) * 2)` | 16px | Hero cards, major CTA blocks |
| `--radius-3xl` | `calc(var(--radius) * 2.6)` | 20.8px | Large media cards, showcase panels |
| `--radius-4xl` | `calc(var(--radius) * 3.2)` | 25.6px | Extra-large decorative containers |

Pill/full-round: `rounded-full` (Tailwind). Not a named token.

---

## 5. Glassmorphism System

The core visual language. Every elevated surface in dark mode uses `.glass-panel` or equivalent.

### `.glass-panel` — Base

```css
.glass-panel {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.1) 0%, oklch(1 0 0 / 0.03) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);       /* Safari */
  border: 1px solid oklch(1 0 0 / 0.12);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.dark .glass-panel {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.05) 0%, oklch(1 0 0 / 0.01) 100%);
  border: 1px solid oklch(1 0 0 / 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}

.glass-panel:hover {
  border-color: oklch(1 0 0 / 0.2);
  background: linear-gradient(145deg, oklch(1 0 0 / 0.12) 0%, oklch(1 0 0 / 0.05) 100%);
}

.dark .glass-panel:hover {
  border-color: oklch(1 0 0 / 0.15);
  background: linear-gradient(145deg, oklch(1 0 0 / 0.08) 0%, oklch(1 0 0 / 0.02) 100%);
  box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.6);
}
```

**What each property does:**
- `background: linear-gradient(145deg, ...)` — thin white translucent gradient. Creates "frosted" fill without killing blurred content behind it.
- `backdrop-filter: blur(24px)` — 24px Gaussian blur on everything directly behind. This is the defining glass effect. **Requires visible background content (mesh orbs)** — against a flat background the blur has nothing to smear.
- `border: 1px solid oklch(1 0 0 / 0.08)` — translucent white hairline that "catches light" and defines the panel boundary.
- `box-shadow` — depth shadow beneath the panel.
- `transition` — smooth hover state changes.

### `.glass-strong` — Auth forms, modals

```css
.glass-strong {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.075) 0%, oklch(1 0 0 / 0.025) 100%);
  backdrop-filter: blur(48px) saturate(180%);
  -webkit-backdrop-filter: blur(48px) saturate(180%);
  border: 1px solid oklch(1 0 0 / 0.12);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 oklch(1 0 0 / 0.10),
    inset 0 -1px 0 oklch(0 0 0 / 0.08);
}
```

48px blur + saturation boost = more intense frosting. Inset highlights give depth to the panel edge.

### `.glass-sidebar` — Sidebar panel

```css
.glass-sidebar {
  background: linear-gradient(
    180deg,
    oklch(0.11 0.028 268 / 0.97) 0%,
    oklch(0.08 0.022 268 / 0.99) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

### `.glass-header` — Sticky header

```css
.header-glass {
  background: oklch(0.06 0.025 270 / 0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  box-shadow:
    0 1px 0 oklch(1 0 0 / 0.06),
    0 4px 24px rgba(0, 0, 0, 0.22);
}
```

### Glassmorphism Checklist

For `backdrop-filter: blur()` to produce visible frosted glass:
1. `.mesh-bg` + 3 orbs present behind glass content
2. Panel has `position: relative` or is in normal flow above the mesh layer
3. `-webkit-backdrop-filter` prefix included for Safari
4. Panel background uses low-alpha white — not opaque
5. Parent does not have `overflow: hidden` without testing — can clip `backdrop-filter`

---

## 6. Ambient Mesh Background

The atmospheric layer that gives glass panels their blurred backdrop. Place once at root layout level.

```html
<div class="mesh-bg">
  <div class="mesh-orb mesh-orb-1"></div>
  <div class="mesh-orb mesh-orb-2"></div>
  <div class="mesh-orb mesh-orb-3"></div>
</div>
```

```css
.mesh-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--background);  /* dark: oklch(0.06 0.025 270) */
  overflow: hidden;
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);     /* soft radial glow — not a sharp circle */
  opacity: 0.5;
  animation: float-orb 20s infinite ease-in-out alternate;
}
```

### Individual Orbs

| Class | Size | Position | Color | Delay | Role |
|-------|------|----------|-------|-------|------|
| `.mesh-orb-1` | 60vw × 60vh | `top: -10vh; left: -10vw` | `oklch(0.62 0.27 288 / 0.15)` indigo | 0s | Dominant cool glow, top-left |
| `.mesh-orb-2` | 50vw × 50vh | `bottom: -10vh; right: -5vw` | `oklch(0.55 0.28 288 / 0.10)` indigo | -5s | Counterbalance, bottom-right |
| `.mesh-orb-3` | 40vw × 40vh | `top: 40vh; left: 30vw` | `oklch(0.65 0.22 25 / 0.08)` warm orange-red | -10s | Warm center tension point |

Orb-3's hue 25 (orange-red) at 8% opacity adds warmth to center — prevents composition going fully cold blue.

### Float Animation

```css
@keyframes float-orb {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
```

20s, `ease-in-out alternate`. Staggered delays (-5s, -10s) keep all three always out of phase — continuous organic movement. Dashboard: mesh-bg always active, orbs dimmed slightly for usability.

---

## 7. Animations

All entrance animations share `cubic-bezier(0.16, 1, 0.3, 1)` — spring easing that snaps to target with slight overshoot. `opacity: 0` set on the class; elements invisible before animation fires. `fill-mode: forwards` — stays at final state.

### Entrance Animations

| Class | Keyframe | Duration | Use Case |
|-------|----------|----------|----------|
| `.animate-fade-in-up` | `translateY(24px) + opacity 0→1` | 0.9s | Cards, sections, lists — primary workhorse |
| `.animate-fade-in-scale` | `scale(0.96) + translateY(12px) + opacity 0→1` | 1s | Modals, hero elements, prominent feature cards |
| `.animate-grow-up` | `scaleY(0→1)` from `transform-origin: bottom` | 1.2s | Chart bars, vertical progress reveals |
| `.animate-float-in` | `translateY(30px) + rotate(4deg) → 0 + opacity 0→1` | 1s | Decorative floating cards, tilted mockups |

### Stagger Helpers

```css
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.12s; }
.stagger-3 { animation-delay: 0.20s; }
.stagger-4 { animation-delay: 0.28s; }
.stagger-5 { animation-delay: 0.36s; }
.stagger-6 { animation-delay: 0.45s; }
```

Or inline: `<div class="animate-fade-in-up" style="animation-delay: 0.2s">`

Always include `animation-delay: 0s` on first element — skipping it causes the sequence to feel out of sync.

### Marquee Animation

```css
@keyframes marquee-left {
  from { transform: translateX(0) }
  to   { transform: translateX(-50%) }
}

.animate-marquee {
  animation: marquee-left 28s linear infinite;
  width: max-content;
  will-change: transform;   /* GPU compositing */
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

Content must be duplicated (first copy + identical second copy). `translateX(-50%)` on doubled content = seamless loop.

---

## 8. Component Styles

### Primary CTA Button

```css
/* Standard pattern — from Tailwind + shadcn/ui + .btn-glow */
.btn-glow {
  transition: box-shadow 0.3s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
}
.btn-glow:hover {
  box-shadow: 0 0 24px #ff500b59, 0 4px 16px rgba(0, 0, 0, 0.3);
}
.btn-glow:active {
  transform: translateY(1px);
}
```

```html
<button class="bg-primary text-primary-foreground rounded-full px-6 py-3
               font-medium btn-glow transition-shadow">
  Get Started Free
</button>
```

Orange glow bloom on hover. `rounded-full` for pill CTAs. `rounded-lg` for secondary actions.

### Glass Panels (Usage)

```html
<!-- Standard card — stat cards, panels -->
<div class="glass-panel rounded-xl p-6">...</div>

<!-- Subtle nested panel -->
<div class="glass-panel rounded-lg p-4 [&]:bg-[oklch(1_0_0/0.04)]">...</div>

<!-- Prominent hero/CTA card -->
<div class="glass-panel rounded-2xl p-8 [&]:border-white/20">...</div>
```

### Inputs

```html
<input class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
              placeholder:text-muted-foreground input-focus-glow" />
```

```css
.input-focus-glow:focus-visible {
  border-color: #FF500B55 !important;
  box-shadow: 0 0 0 3px #FF500B18, 0 0 20px #FF500B0C !important;
  outline: none !important;
}
```

### Badges

```html
<!-- Status badges -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
             bg-green-500/10 text-green-400 border border-green-500/20">Connected</span>

<span class="... bg-red-500/10 text-red-400 border-red-500/20">Blocked</span>

<span class="... bg-amber-500/10 text-amber-400 border-amber-500/20">Warning</span>

<span class="... bg-white/5 text-muted-foreground border-white/10">Soon</span>
```

### Dialogs / Modals

```html
<DialogContent class="bg-card border-white/10 text-foreground rounded-xl sm:max-w-md
                      glass-strong">
  <DialogHeader>
    <DialogTitle class="text-base font-semibold" />
  </DialogHeader>
</DialogContent>
```

### Card Interactions

```css
/* Hover lift — stat cards, project cards */
.card-lift {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
}
.card-lift:hover  { transform: translateY(-3px); }
.card-lift:active { transform: translateY(-1px); }

/* Hover tint — subtle blue-indigo wash on hover */
.card-hover-tint {
  position: relative;
  overflow: hidden;
}
.card-hover-tint::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, oklch(0.62 0.27 288 / 0.045) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}
.card-hover-tint:hover::after { opacity: 1; }

/* Ambient glow — used on pricing CTA card */
.glow-ambient {
  box-shadow: 0 0 40px rgba(255, 80, 11, 0.12), 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### CTA Card Gradient

```css
.cta-gradient {
  background: linear-gradient(
    135deg,
    oklch(0.55 0.22 32 / 0.07) 0%,
    oklch(0.55 0.22 32 / 0.02) 60%,
    transparent 100%
  );
}
```

### Footer Links

```css
.footer-link {
  position: relative;
  display: inline-block;
  color: oklch(0.56 0.05 268);    /* --muted-foreground dark */
  transition: color 0.2s ease, transform 0.2s ease;
}
.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #FF500B;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.footer-link:hover {
  color: oklch(0.97 0 0);   /* near-white */
  transform: translateX(4px);
}
.footer-link:hover::after { width: 100%; }
```

Hover: text brightens + shifts 4px right + orange underline sweeps from left (spring easing).

### Scrollbar

```css
* {
  scrollbar-width: thin;
  scrollbar-color: oklch(1 0 0 / 0.15) transparent;
}
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: oklch(1 0 0 / 0.12); border-radius: 8px; }
*::-webkit-scrollbar-thumb:hover { background: oklch(1 0 0 / 0.22); }
```

### Text Selection

```css
::selection { background: #FF500B; color: #fff; }
```

---

## 9. Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #FF7733 0%, #FF500B 60%, #CC4008 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-warm {
  background: linear-gradient(135deg, #ff9a6b 0%, #FF500B 55%, #e04000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Usage rules:**
- Apply to `<h1>` or `<h2>` at display scale (≥48px). Smaller than ~32px = gradient invisible.
- One `gradient-text` heading per hero section.
- Works on dark backgrounds (designed for dark-first).
- Do not combine with `font-italic` — gradient clip interacts poorly with skewed glyph bounds.

---

## 10. Layout Principles

### Z-Layering
```
z-index: -1  → .mesh-bg (fixed backdrop)
z-index: 0+  → page content, glass panels
z-index: 50+ → modals, overlays, dropdown menus
```

### Content Width
- Full sections: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Centered content blocks: `max-w-4xl mx-auto`
- Centered narrow (auth forms): `max-w-md mx-auto`

### Section Rhythm
- Marketing sections: `py-24` or `py-32`
- Dashboard panels: `p-6` or `p-8`
- Between cards: `gap-4` (16px)
- Section stacks: `space-y-6` (24px)
- Form field gaps: `space-y-4` (16px)

### Breakpoints (Tailwind defaults)
```
sm:  640px    → 2-col card grids
md:  768px    → hero text scale up; tablet optimizations
lg:  1024px   → sidebar visible; 3-col grids; 4-col stat cards
xl:  1280px   → full layout width
2xl: 1536px   → wide monitor padding
```

No custom breakpoints defined in globals.css.

### Dashboard Shell Layout
```
┌─────────────────────────────────────────────────────┐
│ .glass-sidebar (240px, fixed left)  │ Main Content   │
│                                     │ (lg:pl-60)     │
│ 🔶 FRUGAL (logo + Ethnocentric)     │                │
│                                     │ ← Page Header  │
│ Dashboard        ← active orange    │                │
│ Projects                            │ ← Content      │
│ Alerts                              │   (server comp)│
│ ──────────────                      │                │
│ Billing                             │                │
│ Settings                            │                │
│ Contact                             │                │
│                                     │                │
│ [Plan badge]                        │                │
│ [User avatar + email]               │                │
└─────────────────────────────────────┴────────────────┘
```

Background: `mesh-bg` with orbs — always fixed, always behind.

Mobile: sidebar collapses to hamburger on `< lg`. Main content: `pl-0` on mobile, `lg:pl-60` on desktop. Never use `margin-left` for sidebar offset — use `padding-left` on the main content element.

### Dashboard Glass Panels (not flat cards)
All dashboard panels use `.glass-panel`, not flat `bg-card`. Against the `mesh-bg`, flat opaque cards look disconnected. Glass panels blend with the atmospheric background.

---

## 11. Accessibility & Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-fade-in-scale,
  .animate-grow-up,
  .animate-float-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .mesh-orb,
  .animate-marquee {
    animation: none;
  }
  .card-lift,
  .card-lift:hover,
  .card-lift:active {
    transform: none;
  }
}
```

All ShadCN/UI components come with keyboard navigation and ARIA attributes built in. Focus rings use `#FF500B` (`--ring`) consistently.

---

## 12. Marketing Page Structure

### Landing Page (`/`) — Section Order

1. **Hero** — gradient-text h1 + subheadline + dual CTA (Get Started Free / View Pricing) + code snippet showing `frugal.wrap()` + floating SDK mockup card
2. **Social proof** — marquee strip with provider logos (OpenAI, Anthropic, Replicate, fal.ai, Groq, Gemini)
3. **Problem section** — "Your AI bill surprises you. Frugal doesn't let that happen." + pain point stats
4. **Features grid** — 6 features, icon + title + 2-line description, `.animate-fade-in-up` + stagger
5. **How it works** — 3-step: Install SDK / Connect project / Set rules + animated flow diagram
6. **Pricing section** — 3-tier cards (Free / Plus $19 / Pro $49) + Corporate contact CTA + annual toggle
7. **FAQ** — 6–8 common questions, accordion
8. **Footer** — logo + nav columns + social icons + giant "FRUGAL" Ethnocentric wordmark (gradient-clipped, semi-transparent)

### Footer Structure

```
┌──────────────────────────────────────────────────────┐
│ 1px gradient glow line + orange blur circle          │
│                                                      │
│ Logo (SVG + Ethnocentric wordmark) + tagline         │
│                                                      │
│ [Product]  [Company]  [Legal]  [Support]             │
│ Dashboard  About      Privacy  Documentation         │
│ Pricing    Blog       Terms    Contact               │
│ Changelog  Changelog  ...      Status                │
│                                                      │
│ ─────────────────────────────────────────────────── │
│                                                      │
│            F  R  U  G  A  L                          │
│      (Ethnocentric, gradient-text, giant, semi-trans)│
└──────────────────────────────────────────────────────┘
```

Social links: Twitter, LinkedIn, GitHub.

---

## 13. Design Do's and Don'ts

### Do
- Apply `.glass-panel` to all elevated surfaces in dark mode
- Use `.mesh-bg` + all three orbs at the layout root — never per-page
- Apply `gradient-text` to the primary headline in each hero section only
- Use Inter for all UI text including navigation, buttons, forms, tables, dashboard labels
- Reserve Ethnocentric exclusively for "FRUGAL" wordmark — logo area only
- Use `#FF500B` for one interactive accent per visual section
- Apply spring easing `cubic-bezier(0.16, 1, 0.3, 1)` on all entrance and hover animations
- Include `-webkit-backdrop-filter` alongside `backdrop-filter` for Safari
- Use `will-change: transform` on animated marquee element for GPU compositing
- Stagger entrance animations with `.stagger-N` or inline `animation-delay`
- Always include `animation-delay: 0s` on the first staggered element

### Don't
- Don't use Ethnocentric for section headings, navigation, card titles, or any text other than the wordmark
- Don't apply `gradient-text` to text smaller than ~32px — gradient becomes invisible
- Don't stack multiple `gradient-text` headings in one section — one per section maximum
- Don't add `box-shadow` beyond the built-in `.glass-panel` shadow — fights the frosted effect
- Don't place glass panels against a flat background with no content behind them
- Don't use `#FF500B` as a surface fill, background color, or decorative pattern — accent for single elements only
- Don't use Playwrite IN, Nasalization, or Playfair Display in dashboard or app UI
- Don't apply entrance animations to elements already visible on page load without a scroll trigger
- Don't use `overflow: hidden` on a parent of a glass panel without testing — breaks `backdrop-filter` in some browsers
- Don't use chart colors 2–5 (indigo-blue series) as UI accent colors — data visualization only
- Don't set `animation-fill-mode` other than `forwards` on entrance animations
- Don't add `box-shadow` drop shadows on glass cards beyond the built-in shadow

---

## 14. Integration Spec

### Auth.js (NextAuth v5)
- Config: `lib/auth.ts`
- Handler: `app/api/auth/[...nextauth]/route.ts`
- Session (server): `import { auth } from '@/lib/auth'` → `const session = await auth()`
- Session (client): `useSession()` from `next-auth/react`

### Stripe
- Singleton: `lib/stripe.ts` → `new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })`
- Checkout: `stripe.checkout.sessions.create({ mode: 'subscription', ... })`
- Portal: `stripe.billingPortal.sessions.create({ customer: ..., return_url: ... })`
- Webhook runtime: `export const runtime = 'nodejs'` — required for `request.text()` raw body
- HMAC: `stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)`
- PRICE_MAP: `{ plus_monthly: STRIPE_PLUS_MONTHLY_PRICE_ID, plus_annual: ..., pro_monthly: ..., pro_annual: ... }`

### Resend
- Client: `new Resend(process.env.RESEND_API_KEY)`
- From: `noreply@getfrugal.dev` (must be verified domain)
- Templates: React Email components in `lib/email/`
- Send: `resend.emails.send({ from, to, subject, react: <Template {...props} /> })`
- Used in: magic-link auth, welcome email (idempotent via `user_metadata.welcome_email_sent`), budget alerts, subscription changes

### Upstash QStash
- Cron: fires `POST /api/poll` every 5 minutes; `POST /api/reconcile` daily
- Verification: `import { Receiver } from '@upstash/qstash'` → `receiver.verify({ signature, body })`
- Keys: `QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY` (key rotation)
- Dev: `GET /api/poll` bypasses QStash verification

### Upstash Redis
- Client: `import { Redis } from '@upstash/redis'` → `Redis.fromEnv()`
- Rate limiting: `import { Ratelimit } from '@upstash/ratelimit'` → sliding window
- Cache keys:
  - `ik:{sha256_hash}` → `{ projectId, userId, plan }` (60s TTL) — ingest key lookup
  - `status:{projectId}` → `{ state, blockedRules }` (30s TTL) — enforcement state
  - `alert_sent:{projectId}:{ruleId}:{window}` → `1` (3600s TTL) — alert dedup

### Neon / Drizzle
- Client: `lib/db.ts` → `drizzle(neon(process.env.DATABASE_URL!))`
- Schema: imported in `db.ts` as `{ schema }` from `lib/schema/`
- Queries: Drizzle query builder for type-safety; `sql` tag for complex aggregations
- Migrations: `drizzle-kit push` (dev) + migration files in `drizzle/migrations/`

### Cloudflare R2
- Client: `S3Client` from `@aws-sdk/client-s3` with R2 endpoint `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- Current use: none (wired for future report exports)

### Vercel Analytics + Speed Insights
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```