# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** madsrudolph.dev
**Generated:** 2026-09-04 08:05:28
**Category:** General

---

## Global Rules

> **Decision (2026-09-04, second pass):** after seeing the Swiss-dark version live, Mads asked
> for a total redesign after https://sawad.framer.website/ (a Framer portfolio template).
> The system below is that reference translated to this site. It supersedes the
> generated light palette and the earlier Swiss-dark variant. Tokens live in
> `src/styles/global.css`.

### Color Palette (as implemented)

| Role | Value | CSS Variable | Note |
|------|-------|--------------|------|
| Background | `#151312` | `--color-background` | the reference's warm near-black |
| Surface | `rgba(255,255,255,.05)` | `--color-surface` | every card; hover `.09` |
| Surface solid | `#1F1D1C` | `--color-surface-solid` | code, thumbnails |
| Foreground | `#FFFFFF` | `--color-foreground` | |
| Foreground 2 | `#B3ABAB` | `--color-foreground-2` | body copy in cards, 8:1 |
| Muted foreground | `#8F8888` | `--color-muted-foreground` | captions, meta, 5.2:1 |
| Dim | `#3A3636` | `--color-dim` | second line of stacked display headings only |
| Orange | `#F46C38` | `--color-orange` | primary action, one focus card, course codes |
| Lime | `#C5FF41` | `--color-lime` | second focus card, pressed filter, current term |
| On bright | `#151312` | `--color-on-bright` | text on orange/lime buttons |

Orange and lime only appear on things you can act on or that are "now". White text sits on the
orange card only at display size (3:1 large-text AA); buttons use dark text on both colours.

### Typography

- **Display:** Poppins 700 (self-hosted, `@fontsource/poppins`), upper-case, stacked two-line
  section titles with the second line dimmed — the reference's signature
- **Body:** Inter (variable, `@fontsource-variable/inter`), 16px / 1.65
- **Data:** IBM Plex Mono for code, course codes and repo figures
- **Scale:** 12 · 14 · 16 · 18 · 22 · 28 · 36 · display clamp(2.25rem, 6vw, 3.25rem) · hero clamp(2.5rem, 7vw, 3.75rem)

### Layout

- One centred column, 47rem (~750px), like the reference; write-ups use the same column
- Floating pill navigation, fixed at the top, icon + label (icon-only under 640px, labels stay
  in the accessibility tree), current page filled white
- Cards: 24px radius for sections/rows, 16px for media, 8px for thumbnails, 999px for buttons
- Home page is one scroller: hero (portrait, name, tagline, upper-case role) → three stats →
  two coloured focus cards → recent projects → study & work → bench & toolchain → this
  semester → contact
- Motion: hover/press only; no scroll-reveal; `prefers-reduced-motion` disables transitions

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #2563EB;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #18181B;
  border: 2px solid #18181B;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FAFAFA;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #18181B;
  outline: none;
  box-shadow: 0 0 0 3px #18181B20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Hero + Features + CTA

- **Conversion Strategy:** Deep CTA placement. For CTA label text, verify at least 4.5:1 against the button fill; use 7:1 only when the product explicitly targets AAA normal-text contrast. Keep focus and component boundaries independently visible. Disable hero parallax under reduced motion and render its static final state.
- **CTA Placement:** Hero (sticky) + Bottom
- **Section Order:** Hero with headline/image > Value prop > Key features (3-5) > CTA section > Footer

---

## Anti-Patterns (Do NOT Use)


### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
