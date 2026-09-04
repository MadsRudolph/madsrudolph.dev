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

> **Decision (2026-09-04):** the generated system proposed a light Swiss palette. The site
> keeps its dark ground by the owner's choice, so the palette below is the **dark variant**
> of the same monochrome-plus-one-accent system. Everything else from the generated
> system — Swiss/minimal layout, Archivo + Space Grotesk, hairline rules, no glass, no
> glow, one accent — stands. Tokens live in `src/styles/global.css`.

### Color Palette (dark variant, as implemented)

| Role | Hex | CSS Variable | Contrast on background |
|------|-----|--------------|------------------------|
| Background | `#0F1012` | `--color-background` | — |
| Surface (code, thumbs) | `#151618` | `--color-surface` | — |
| Foreground | `#F4F4F2` | `--color-foreground` | 18:1 |
| Foreground 2 (secondary text) | `#B9BAC0` | `--color-foreground-2` | 9:1 |
| Muted foreground (labels, captions) | `#8E9096` | `--color-muted-foreground` | 5.7:1 |
| Border (hairlines) | `#26272B` | `--color-border` | — |
| Border strong (chips, buttons) | `#3B3C42` | `--color-border-strong` | 3:1 vs bg |
| Accent (the one colour) | `#5B9DFF` | `--color-accent` | 7:1 |
| On accent | `#0B1220` | `--color-on-accent` | 7:1 on accent |
| Ring (focus) | `#F4F4F2` | `--color-ring` | — |
| Status ok / in progress | `#6FCF97` / `#E6B23C` | `--color-status-*` | always paired with a text label |

**Color Notes:** Monochrome + blue accent. Accent is used for: the full stop in the hero
headline, the current-nav underline, the primary button, hover on links and card titles,
and section numbers in write-ups. Nothing else. Status dots never carry meaning alone.

### Typography

- **Heading Font:** Archivo (variable, self-hosted via `@fontsource-variable/archivo`) — weight 600, tracking −0.02 to −0.035em
- **Body Font:** Space Grotesk (variable, self-hosted via `@fontsource-variable/space-grotesk`) — 17px/1.6 desktop, 16px mobile
- **Data Font:** IBM Plex Mono — only for code, repo figures, index numbers and tabular data
- **Scale:** 12 · 14 · 16 · 17 · 18 · 22 · 28 · 36 · display clamp(2.75rem, 7.5vw, 5.25rem)
- **Mood:** minimal, portfolio, clean, engineering

Fonts are bundled, not loaded from Google Fonts, so the site stays first-party and works offline.

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
