---
version: alpha
name: frugal-design-system
description: Frugal's visual design system — dark-first glassmorphism SaaS built on deep indigo-navy surfaces, #FF500B brand orange, ambient mesh orb backgrounds, frosted-glass panels, and spring-curve entrance animations. Primary reference for all UI decisions.

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
  chart-5: "oklch(0.38 0.22 283)"  # dark mode: oklch(0.35 0.22 283)

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

## Overview

Frugal is a dark-first glassmorphism SaaS product for AI API cost management. The visual language centers on three locked ideas: deep indigo-navy space, frosted glass panels that float above it, and a single aggressive orange (`#FF500B`) as the sole accent color.

The home page and marketing surfaces are intentionally atmospheric — ambient mesh orbs pulse slowly behind frosted cards while content entrance-animates with spring curves. Dashboard surfaces carry the same glass panels but dial back the orb drama for usability. Every brand touchpoint reinforces the same tension: cold dark space, warm orange signal, frosted glass in between.

**Key Characteristics:**

- Deep indigo-navy backgrounds (`oklch(0.06 0.025 270)`) as the dominant canvas in dark mode.
- Glassmorphism panels with `backdrop-filter: blur(24px)`, white-translucent gradients, and hairline white borders.
- Three floating ambient orbs — two indigo-blue, one warm — that drift with a 20-second float animation.
- Single accent color `#FF500B` (orange): CTAs, rings, glow text, chart-1, gradient text, footer underlines.
- Inter for all functional UI text. Ethnocentric exclusively for the "FRUGAL" wordmark.
- Gradient text utility for hero headings: `#FF7733 → #FF500B → #CC4008` at 135°.
- Spring-curve entrance animations (`cubic-bezier(0.16, 1, 0.3, 1)`) across four animation types.
- Marquee scroll animation for logo/partner strips at 28s linear.
- Footer links with orange underline-slide and `translateX(4px)` hover lift.

---

## Colors

### Brand & Accent

- **Primary Orange** `#FF500B` — The sole interactive accent. Used for primary CTA buttons, focus rings (`--ring`), gradient text, chart-1 series, footer link underlines, glow bloom effects, and the logo mark.
- **On Primary** `#FFFFFF` — Text and icons that appear directly on orange surfaces.
- **Gradient Orange** — Three-stop linear gradient `135deg`: `#FF7733 0%` → `#FF500B 60%` → `#CC4008 100%`. Used on hero text via `gradient-text` utility. Not used as a surface fill.

### Dark Mode Surfaces (Primary Use-Case)

The dark theme is the design's true personality. All glassmorphism components are built for and tested against this palette.

| Token                  | Value                     | Computed Approx | Role                                                  |
|------------------------|---------------------------|-----------------|-------------------------------------------------------|
| `--background`         | `oklch(0.06 0.025 270)`   | #07060F deep navy | Page background — the canvas behind all glass panels |
| `--card`               | `oklch(0.10 0.025 268)`   | #0D0C17         | Card surface — glass panels sit on this              |
| `--popover`            | `oklch(0.10 0.025 268)`   | #0D0C17         | Dropdown / popover surface                           |
| `--secondary`          | `oklch(0.14 0.025 268)`   | #131220         | Secondary surface, sidebar chips                     |
| `--muted`              | `oklch(0.13 0.025 268)`   | #111020         | Muted surface, de-emphasized blocks                  |
| `--muted-foreground`   | `oklch(0.56 0.05 268)`    | #7878A8         | Subdued label text, metadata                         |
| `--accent`             | `oklch(0.13 0.025 268)`   | #111020         | Accent surface (same as muted in dark)               |
| `--accent-foreground`  | `oklch(0.97 0 0)`         | #F7F7F7         | Text on accent surface                               |
| `--foreground`         | `oklch(0.97 0 0)`         | #F7F7F7         | Primary text on dark backgrounds                     |
| `--border`             | `oklch(1 0 0 / 0.08)`     | white 8% alpha  | Panel borders — extremely subtle hairlines           |
| `--input`              | `oklch(1 0 0 / 0.10)`     | white 10% alpha | Form input backgrounds                               |
| `--destructive`        | `oklch(0.65 0.22 25)`     | #E04A2A         | Error states (slightly brighter than light mode)     |
| `--ring`               | `#FF500B`                 | —               | Focus ring — same orange as primary                  |

### Light Mode Surfaces

Light mode exists and is fully functional, but is not the design's primary personality. Use it for document-heavy pages or user preference.

| Token                  | Value                         | Role                          |
|------------------------|-------------------------------|-------------------------------|
| `--background`         | `oklch(1 0 0)`                | Pure white canvas             |
| `--foreground`         | `oklch(0.145 0.008 326)`      | Near-black text               |
| `--card`               | `oklch(1 0 0)`                | White card surface            |
| `--secondary`          | `oklch(0.967 0.001 286.375)`  | Very light grey               |
| `--muted`              | `oklch(0.96 0.003 325.6)`     | Muted off-white               |
| `--muted-foreground`   | `oklch(0.542 0.034 322.5)`    | Mid-grey subdued text         |
| `--border`             | `oklch(0.922 0.005 325.62)`   | Light grey border             |
| `--input`              | `oklch(0.922 0.005 325.62)`   | Input border/background       |
| `--destructive`        | `oklch(0.577 0.245 27.325)`   | Red error                     |

### Chart Color Palette

Five-stop sequential palette. Starts orange, shifts into indigo-blue. Designed for dark backgrounds — lower L values in the blue stops ensure contrast.

| Token       | Light Value              | Dark Value               | Hue      |
|-------------|--------------------------|--------------------------|----------|
| `--chart-1` | `#FF500B`                | `#FF500B`                | Orange   |
| `--chart-2` | `oklch(0.65 0.27 288)`   | `oklch(0.65 0.27 288)`   | Blue     |
| `--chart-3` | `oklch(0.55 0.28 288)`   | `oklch(0.55 0.28 288)`   | Blue-mid |
| `--chart-4` | `oklch(0.45 0.26 285)`   | `oklch(0.45 0.26 285)`   | Deep blue|
| `--chart-5` | `oklch(0.38 0.22 283)`   | `oklch(0.35 0.22 283)`   | Navy     |

---

## Typography

### Font Families

Six font families are loaded. Only two are used in day-to-day UI.

| CSS Variable            | Family              | Source              | Weight Range | Role                                          |
|-------------------------|---------------------|---------------------|--------------|-----------------------------------------------|
| `--font-sans` (base `*`)| Inter               | Google Fonts        | 100–900      | All functional UI text — body, labels, buttons, nav, forms |
| `--font-serif`          | Instrument Serif    | Google Fonts        | 400 (+ italic) | Accent serif — marketing, pull quotes, italic moments |
| `--font-playfair`       | Playfair Display    | Local `/font/`      | 100–900 variable | Editorial display — high-fashion marketing headlines |
| `--font-playwrite`      | Playwrite IN        | Local `/font/`      | 100–900 variable | Cursive accent — decorative, not functional   |
| `--font-ethnocentric`   | Ethnocentric        | Local `/font/`      | 400           | Wordmark only — "FRUGAL" brand mark           |
| `--font-nasalization`   | Nasalization        | Local `/font/`      | 400           | Technical/sci-fi labels — optional decorative |

**Font loading:** Inter via Google Fonts CDN. Playfair Display, Playwrite IN, Ethnocentric, Nasalization loaded from local `/public/font/` via `@font-face` with `font-display: swap`.

### Hierarchy

There is no formal size ramp encoded in globals.css beyond the Tailwind defaults. Apply Tailwind's type scale (`text-xs` through `text-9xl`) with Inter as the base. Reserved use-cases for non-Inter fonts:

| Role                  | Font             | Typical Size | Weight | Notes                                          |
|-----------------------|------------------|--------------|--------|------------------------------------------------|
| Page wordmark / logo  | Ethnocentric     | 20–32px      | 400    | Uppercase brand mark only — never body copy    |
| Hero gradient heading | Inter            | 48–96px      | 700–800| Apply `gradient-text` utility                  |
| Marketing subheading  | Instrument Serif | 24–40px      | 400    | Italic variant for elegance moments            |
| Editorial display     | Playfair Display | 48–72px      | 400    | High-fashion marketing sections only           |
| All UI / functional   | Inter            | 12–18px      | 400–600| Nav, buttons, labels, body, forms, metadata    |
| Technical mono accent | Nasalization     | 12–14px      | 400    | Sci-fi / tech label moments in marketing       |

### Principles

- Inter handles everything functional. One font for all UI — no decorative fonts in navigation, forms, dashboards, or tables.
- Ethnocentric is one-token — the FRUGAL wordmark. Treat it as a logo, not a typeface.
- Gradient text works at display scale (48px+). Do not apply it to body text or captions.
- Instrument Serif earns its place in marketing sections where editorial warmth is intentional. Never in app UI.
- Weight contrast (400 vs 700) does most heading hierarchy work. Avoid heavy tracking manipulation.

---

## Radius Scale

Base: `--radius: 0.5rem` (8px). All radius tokens derive from this via `calc()`.

| Token          | Formula                      | Value (at base 8px) | Role                                              |
|----------------|------------------------------|---------------------|---------------------------------------------------|
| `--radius-sm`  | `calc(var(--radius) * 0.6)`  | 4.8px               | Small inputs, tight chips, icon badges            |
| `--radius-md`  | `calc(var(--radius) * 0.8)`  | 6.4px               | Form inputs, secondary cards                      |
| `--radius-lg`  | `var(--radius)`              | 8px                 | Standard cards, panels, dialogs                   |
| `--radius-xl`  | `calc(var(--radius) * 1.5)`  | 12px                | Feature cards, prominent panels                   |
| `--radius-2xl` | `calc(var(--radius) * 2)`    | 16px                | Hero cards, major CTA blocks                      |
| `--radius-3xl` | `calc(var(--radius) * 2.6)`  | 20.8px              | Large media cards, showcase panels                |
| `--radius-4xl` | `calc(var(--radius) * 3.2)`  | 25.6px              | Extra-large decorative containers                 |

**Pill / full-round:** Use Tailwind `rounded-full` for pill buttons and avatars. Not a named token.

---

## Glassmorphism System

The core visual language of Frugal. Every elevated surface in the dark theme uses the `.glass-panel` class or an equivalent custom implementation.

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

**What each property does:**
- `background: linear-gradient(145deg, oklch(1 0 0 / 0.1) → oklch(1 0 0 / 0.03))` — thin white translucent gradient at 145°. Creates the "frosted" fill without killing the blurred content behind it. Light mode uses higher opacity (0.1→0.03), dark uses 0.05→0.01.
- `backdrop-filter: blur(24px)` — 24px Gaussian blur on everything directly behind the panel. This is the defining glass effect. Requires the background to have visible content (mesh orbs, gradients) — a plain white background makes it invisible.
- `border: 1px solid oklch(1 0 0 / 0.12)` — translucent white hairline. This edge "catches light" and defines the panel boundary in dark mode. In dark mode drops to 0.08 alpha.
- `box-shadow: 0 8px 32px 0 rgba(0,0,0,0.2)` — subtle depth shadow beneath the panel. In dark mode rises to 0.4 to maintain depth perception.
- `transition` — smooth state changes on border, background, and shadow.

### Dark Mode Variant

Applied via `.dark .glass-panel`:

```css
.dark .glass-panel {
  background: linear-gradient(145deg, oklch(1 0 0 / 0.05) 0%, oklch(1 0 0 / 0.01) 100%);
  border: 1px solid oklch(1 0 0 / 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

Fill drops to near-invisible (0.05→0.01). The glass effect is almost entirely from `backdrop-filter`. Border drops to 0.08 — extremely subtle.

### Hover States

```css
/* Light hover */
.glass-panel:hover {
  border-color: oklch(1 0 0 / 0.2);
  background: linear-gradient(145deg, oklch(1 0 0 / 0.12) 0%, oklch(1 0 0 / 0.05) 100%);
}

/* Dark hover */
.dark .glass-panel:hover {
  border-color: oklch(1 0 0 / 0.15);
  background: linear-gradient(145deg, oklch(1 0 0 / 0.08) 0%, oklch(1 0 0 / 0.02) 100%);
  box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.6);
}
```

Hover lifts: border gets brighter, fill gets slightly more opaque, shadow deepens. The panel "rises" toward the user.

### Glassmorphism Requirements

For `backdrop-filter: blur()` to produce visible frosted glass, the background behind the panel must have visual content. This is why `.mesh-bg` + ambient orbs are mandatory when using glass panels. Against a plain `oklch(0.06 0.025 270)` with no orbs, the blur has nothing to smear — the glass effect becomes invisible.

**Checklist for correct glass rendering:**
1. `.mesh-bg` + 3 orbs present on the page behind the glass content.
2. Panel element has `position: relative` or is in normal flow above the mesh layer.
3. `-webkit-backdrop-filter` prefix included for Safari.
4. Panel background uses `oklch(1 0 0 / low-alpha)` — not opaque.
5. Parent does not have `overflow: hidden` without careful consideration — it can clip `backdrop-filter`.

---

## Ambient Mesh Background

The atmospheric layer that gives glass panels their blurred backdrop. Placed once at layout level with `position: fixed; inset: 0; z-index: -1`.

```html
<div class="mesh-bg">
  <div class="mesh-orb mesh-orb-1"></div>
  <div class="mesh-orb mesh-orb-2"></div>
  <div class="mesh-orb mesh-orb-3"></div>
</div>
```

### `.mesh-bg`

```css
.mesh-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--background);  /* dark: oklch(0.06 0.025 270) */
  overflow: hidden;
}
```

Fixed, full-viewport, behind everything. Renders the page background color and contains the orbs.

### Orb Properties (shared base)

```css
.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);     /* heavy blur — turns solid orb into soft glow */
  opacity: 0.5;
  animation: float-orb 20s infinite ease-in-out alternate;
}
```

80px blur on a circular element = soft radial glow. Not a sharp circle.

### Individual Orbs

| Class         | Size       | Position                 | Color                                   | Delay | Role                              |
|---------------|------------|--------------------------|-----------------------------------------|-------|-----------------------------------|
| `.mesh-orb-1` | 60vw×60vh  | `top: -10vh; left: -10vw`| `oklch(0.62 0.27 288 / 0.15)` indigo   | 0s    | Dominant cool glow, top-left      |
| `.mesh-orb-2` | 50vw×50vh  | `bottom: -10vh; right: -5vw` | `oklch(0.55 0.28 288 / 0.10)` indigo | -5s   | Counterbalance, bottom-right      |
| `.mesh-orb-3` | 40vw×40vh  | `top: 40vh; left: 30vw`  | `oklch(0.65 0.22 25 / 0.08)` warm red | -10s  | Warm center tension point         |

Orb-3's `oklch(0.65 0.22 25)` has hue 25 — a warm orange-red. At 8% opacity it's barely visible but adds warmth to the center, preventing the composition from going fully cold blue.

### Float Animation

```css
@keyframes float-orb {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
```

20s duration, `ease-in-out alternate` — orbs drift +30px/-50px range, breathe in scale 0.9–1.1. The alternating direction + staggered delays (-5s, -10s) means all three are always out of phase, creating continuous organic movement.

---

## Gradient Text

Marketing / hero heading accent. Applied to a heading element, not a container.

```css
.gradient-text {
  background: linear-gradient(135deg, #FF7733 0%, #FF500B 60%, #CC4008 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Three-stop orange gradient: light orange → brand orange → dark orange at 135°. The gradient creates depth in what would otherwise be a flat orange heading.

**Usage rules:**
- Apply to `<h1>` or `<h2>` at display scale (48px+). Smaller than ~32px and the gradient becomes invisible at normal reading distances.
- One `gradient-text` heading per hero section. Not for subheadings, labels, or body copy.
- Works on both light and dark backgrounds — but designed for dark.
- Do not combine with `font-italic` — the gradient clip interacts poorly with skewed glyph bounds in some browsers.

---

## Animations

All entrance animations share `cubic-bezier(0.16, 1, 0.3, 1)` — a spring easing that reaches its target fast then slightly overshoots, creating a physical "snap into place" feel. Initial `opacity: 0` is set on the class, so elements are invisible before animation fires.

### Entrance Animations

| Class                    | Keyframe                                              | Duration | Use Case                                        |
|--------------------------|-------------------------------------------------------|----------|-------------------------------------------------|
| `.animate-fade-in-up`    | `translateY(24px) + opacity 0→1`                     | 0.9s     | Content cards, sections, lists — primary workhorse |
| `.animate-fade-in-scale` | `scale(0.96) + translateY(12px) + opacity 0→1`      | 1s       | Modals, hero elements, prominent feature cards  |
| `.animate-grow-up`       | `scaleY(0→1)` from `transform-origin: bottom`        | 1.2s     | Bar chart bars, vertical progress reveals       |
| `.animate-float-in`      | `translateY(30px) + rotate(4deg) → 0 + opacity 0→1` | 1s       | Decorative floating cards, tilted mockups       |

All defined with `forwards` fill — element stays in final state after animation completes.

**Stagger pattern:** Apply `animation-delay` on siblings to stagger entrances:
```html
<div class="animate-fade-in-up" style="animation-delay: 0s">...</div>
<div class="animate-fade-in-up" style="animation-delay: 0.1s">...</div>
<div class="animate-fade-in-up" style="animation-delay: 0.2s">...</div>
```

### Marquee Animation

```css
@keyframes marquee-left {
  from { transform: translateX(0) }
  to   { transform: translateX(-50%) }
}

.animate-marquee {
  animation: marquee-left 28s linear infinite;
  width: max-content;
  will-change: transform;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

Translates content by exactly 50% (assumes content is duplicated — first copy + identical second copy). 28s linear infinite = smooth, unlooping appearance. Hover pauses — good for logo strips where users may want to read. `will-change: transform` promotes to compositor layer for GPU acceleration.

**Setup pattern:**
```html
<div class="overflow-hidden">
  <div class="animate-marquee flex gap-8">
    <!-- content repeated twice, identical -->
    <span>Item A</span><span>Item B</span><span>Item C</span>
    <span>Item A</span><span>Item B</span><span>Item C</span>
  </div>
</div>
```

---

## Footer Link Animation

```css
.footer-link {
  position: relative;
  display: inline-block;
  color: oklch(0.56 0.05 268);  /* --muted-foreground dark */
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

.footer-link:hover::after {
  width: 100%;
}
```

Three things happen on hover simultaneously:
1. Text brightens from muted grey → near-white.
2. Text shifts 4px right — feels like it's being "pulled" toward the destination.
3. Orange underline sweeps in from left using the spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## Components

### `mesh-bg` — Ambient Background

The fixed backdrop. Must be present for glass panels to render correctly.

```html
<div class="mesh-bg">
  <div class="mesh-orb mesh-orb-1"></div>
  <div class="mesh-orb mesh-orb-2"></div>
  <div class="mesh-orb mesh-orb-3"></div>
</div>
```

Place once per layout. Never inside a scrollable container — it must stay `fixed`.

### `glass-panel` — Elevated Surface

The universal card/panel component. Use for feature blocks, stat cards, dialogs, sidebar panels, pricing cards, code blocks, form containers.

```html
<div class="glass-panel rounded-xl p-6">
  <!-- content -->
</div>
```

Combine with Tailwind radius utilities (`rounded-lg`, `rounded-2xl`, etc.) and padding. The class provides only blur, border, shadow, and background — sizing and layout come from Tailwind.

**Variants via Tailwind overrides:**

```html
<!-- Subtle panel - slightly less fill, used for nested panels -->
<div class="glass-panel rounded-lg p-4 [&]:bg-[oklch(1_0_0/0.04)]">

<!-- Prominent panel - more fill, used for hero/CTA cards -->
<div class="glass-panel rounded-2xl p-8 [&]:border-white/20">
```

### `gradient-text` — Hero Heading Accent

Orange gradient on heading text.

```html
<h1 class="gradient-text text-6xl font-bold leading-tight">
  Stop burning money on AI APIs
</h1>
```

### Primary CTA Button

Not a custom CSS class — built from Tailwind + shadcn/ui. The standard pattern:

```html
<button class="bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium
               hover:shadow-[0_0_20px_#FF500B40] transition-shadow">
  Get Started Free
</button>
```

The `hover:shadow` creates an orange glow bloom under the button — a secondary brand signal layered on the primary color.

### `animate-fade-in-up` — Standard Entrance

```html
<section class="animate-fade-in-up" style="animation-delay: 0.2s">
  <!-- section content -->
</section>
```

### `animate-marquee` — Scrolling Strip

```html
<div class="overflow-hidden w-full">
  <div class="animate-marquee flex items-center gap-12">
    <img src="/logo-a.svg" /> <img src="/logo-b.svg" /> <img src="/logo-c.svg" />
    <!-- identical copy for seamless loop -->
    <img src="/logo-a.svg" /> <img src="/logo-b.svg" /> <img src="/logo-c.svg" />
  </div>
</div>
```

### `footer-link` — Animated Footer Nav Link

```html
<a href="/pricing" class="footer-link">Pricing</a>
```

---

## Layout Principles

- **Dark page = mesh-bg always active.** No exceptions. Glass panels against flat dark = invisible blur.
- **Z-layering:** `mesh-bg` at z-index -1 → page content at z-index 0+ → modals/overlays at z-index 50+.
- **Section rhythm:** Large vertical breathing room. Marketing sections `py-24` or `py-32`. Dashboard panels `p-6` or `p-8`.
- **Content width:** Max `max-w-7xl mx-auto` for full-width sections, `max-w-4xl` for centered content blocks.
- **Glass panels for all elevation:** Cards, dialogs, feature sections, sidebars. Never use a flat `bg-card` against the mesh background in dark mode — it looks disconnected.
- **Orange used once per viewport.** One primary orange CTA button, one gradient-text heading, or one prominent orange accent. Multiple competing orange elements cancel each other.
- **No decorative shadows on glass cards.** The glass effect provides its own depth via `backdrop-filter`. Adding a standard box-shadow competes with and dulls the frosted effect.
- **Entrance animations on scroll-revealed content.** Use `animate-fade-in-up` with staggered delays for card grids. Don't animate everything — only content entering the viewport for the first time.

---

## Do's and Don'ts

### Do

- Apply `.glass-panel` to all elevated surfaces in dark mode.
- Use `.mesh-bg` + all three orbs at the layout root — never per-page.
- Apply `gradient-text` to the primary headline in each hero section.
- Use Inter for all UI text including navigation, buttons, forms, tables, and dashboard labels.
- Reserve Ethnocentric exclusively for the "FRUGAL" wordmark — logo area only.
- Use `#FF500B` for one interactive accent per visual section.
- Apply spring easing `cubic-bezier(0.16, 1, 0.3, 1)` on all entrance animations.
- Include `-webkit-backdrop-filter` alongside `backdrop-filter` for Safari support.
- Use `will-change: transform` on the marquee element for GPU compositing.
- Stagger entrance animations with `animation-delay` on sibling elements (0.1s increments).
- Ensure glass panels have visible background content behind them (orbs, gradients).
- Use `border: 1px solid oklch(1 0 0 / 0.08)` for glass panel borders in dark mode — not `border-border` which is too visible.

### Don't

- Don't use Ethnocentric for section headings, navigation items, card titles, or any text other than the wordmark.
- Don't apply `gradient-text` to text smaller than ~32px — the gradient becomes invisible.
- Don't stack multiple `gradient-text` headings in one section — one per section maximum.
- Don't add `box-shadow` drop shadows to glass panels beyond the built-in `0 8px 32px` — it fights the frosted effect.
- Don't place glass panels against a flat background with no content behind them — the blur renders as nothing.
- Don't use orange (`#FF500B`) as a surface fill, background color, or decorative pattern. It is an accent for single interactive elements only.
- Don't use Playwrite IN, Nasalization, or Playfair Display in dashboard or app UI — only in marketing/editorial sections.
- Don't apply entrance animations to elements that are already visible on page load without an interaction or scroll trigger — it fires once and disappears.
- Don't use `overflow: hidden` on a parent of a glass panel without testing — it can break `backdrop-filter` rendering in some browsers.
- Don't use chart colors 2–5 (indigo-blue series) as UI accent colors — they are reserved exclusively for data visualization.
- Don't set `animation-fill-mode` other than `forwards` on entrance animations — elements will flash back to transparent state.
- Don't skip `animation-delay: 0s` on the first staggered element — it causes the sequence to feel out of sync.

---

## Responsive Behavior

### Mesh Orbs

Orb sizes are expressed in `vw`/`vh` — they scale proportionally to viewport. No responsive overrides needed. On mobile, the 60vw orb at top-left may extend aggressively; ensure the parent `mesh-bg` has `overflow: hidden`.

### Glassmorphism

`backdrop-filter: blur()` is widely supported on modern browsers but is compute-intensive. On older low-power devices the frame rate may drop. `will-change` on animated glass panels is recommended if they have transition animations.

For `prefers-reduced-motion`:
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
  .mesh-orb {
    animation: none;
  }
  .animate-marquee {
    animation: none;
  }
}
```

### Typography

Inter is variable weight — no separate bold/regular file. All Inter size and weight variations are one request. Ethnocentric and Nasalization are single-weight OTF files with no variable axis.

### Breakpoints

Use Tailwind defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`). No custom breakpoints are defined in globals.css.

- Card grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hero text scale: `text-4xl md:text-6xl lg:text-8xl`
- Glass panel padding: `p-4 md:p-6 lg:p-8`
- Marquee speed holds constant across breakpoints — content density changes with viewport width naturally.