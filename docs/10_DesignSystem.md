# 10 — Design System

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-10 (Design Philosophy); EC-06 (Accessibility First), EC-10 (Design System Governance)

---

## 1. Purpose

This Design System document defines the visual language of [PROJECT_NAME]: design tokens (colors, typography, spacing, radius, shadows, motion), component patterns, theming (light/dark mode), and accessibility standards. It operationalizes LOCK-10 (developer-first minimalism inspired by Vercel-like aesthetic) and the Engineering Constitution articles that govern design: EC-06 (accessibility first) and EC-10 (design system governance).

A design system is the single source of truth for visual decisions. Without one, every engineer and designer makes slightly different choices — button radii drift from 6px to 8px to 4px; grays shift from `#666` to `#555` to `#777`; spacing varies from 12px to 16px to 14px. Individually trivial, collectively these inconsistencies make a platform feel unprofessional. The design system prevents this by encoding every visual decision as a token, and every token is consumed via Tailwind classes.

This document is enforced via Tailwind configuration (tokens mapped to Tailwind theme), shadcn/ui component library (consistent primitives), ESLint rules (no inline styles, no hardcoded colors), and code review. Per EC-10, no page may introduce ad hoc UI patterns — every visual element originates from this system.

## 2. Scope

### 2.1 In Scope

- Design tokens: colors, typography, spacing, radius, shadows, motion, z-index.
- Light/dark mode theming strategy.
- Component patterns (Button, Input, Card, etc. — high-level; details in `12_ACD`).
- Accessibility standards (WCAG AA, keyboard, focus, screen reader, reduced motion).
- Icon system (lucide-react).
- Layout grid and breakpoints.
- Animation and transition standards.
- Tailwind theme configuration.

### 2.2 Out of Scope

- Detailed component APIs and props → `12_ACD`.
- User flows and interaction patterns → `13_UDS`.
- Specific page layouts → per-page specs in `11_FBRD` and beyond.
- Brand voice and tone → `01_BRD` §3.3.
- Logo design → brand assets in `/public/images/`.

## 3. Architectural Decisions

### AD-01 — Token-Driven Theming via CSS Custom Properties

**Context.** Hardcoded colors in components break dark mode and prevent theming. CSS-in-JS solutions add runtime overhead. A token-driven approach using CSS custom properties enables theme switching without re-renders.

**Decision.** Design tokens are defined as CSS custom properties in `globals.css` at the `:root` level (light theme) and `.dark` class (dark theme). Tailwind theme extension maps these tokens to Tailwind classes (e.g., `bg-background` → `background-color: var(--background)`).

```css
:root {
  --background: 0 0% 100%;           /* white */
  --foreground: 0 0% 3.9%;           /* near black */
  --primary: 0 0% 9%;                /* primary action */
  --primary-foreground: 0 0% 98%;
  /* ... more tokens */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  /* ... more tokens */
}
```

Tailwind config:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        // ... more
      },
    },
  },
};
```

**Consequences.**
- ✅ Theme switching via class toggle on `<html>` — no re-renders.
- ✅ Consistent token usage across all components.
- ✅ Dark mode supported from day 1 (LOCK-10).
- ⚠️ Slight indirection (token → CSS var → Tailwind class); justified by flexibility.

**Implements:** LOCK-10 (Dark/Light mode ready), EC-10 (Design System Governance).

### AD-02 — Monochrome Palette with Single Accent

**Context.** LOCK-10 mandates developer-first minimalism with a monochrome palette. Adding multiple accent colors fragments the visual language.

**Decision.** Palette:
- **Background and foreground:** pure grayscale (white to near-black).
- **Primary actions:** near-black in light mode, near-white in dark mode (inverted).
- **Accent color:** single accent reserved for highlighting (links, focused elements, badges). The accent is configurable via token; default is a subtle blue (`hsl(221, 83%, 53%)`) for familiarity, but can be re-themed without code changes.
- **Semantic colors:** success (green), warning (yellow), destructive (red), info (blue). Used sparingly for status indicators, not decoration.

All other colors are grayscale. No gradients, no decorative color.

**Consequences.**
- ✅ Consistent, professional aesthetic.
- ✅ High contrast (WCAG AAA where feasible — EC-06).
- ✅ Color-blind friendly (semantic meaning conveyed via color + icon, not color alone).

**Implements:** LOCK-10, EC-06.

### AD-03 — Typography Scale

**Context.** Without a defined type scale, font sizes drift (14px, 15px, 16px, 17px all appearing). A modular scale ensures hierarchy and rhythm.

**Decision.** Typography scale (rem-based, 1rem = 16px):

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `text-xs` | 0.75rem (12px) | 400 | Captions, badges, small print |
| `text-sm` | 0.875rem (14px) | 400 | Secondary text, labels, table cells |
| `text-base` | 1rem (16px) | 400 | Body text, default |
| `text-lg` | 1.125rem (18px) | 500 | Section headings, emphasized text |
| `text-xl` | 1.25rem (20px) | 600 | Page subheadings |
| `text-2xl` | 1.5rem (24px) | 600 | Page headings |
| `text-3xl` | 1.875rem (30px) | 700 | Hero headings |
| `text-4xl` | 2.25rem (36px) | 700 | Large hero, marketing |
| `text-5xl` | 3rem (48px) | 700 | Marketing only |

**Font families:**
- **Sans-serif (default):** `Inter` (loaded via `next/font/google`). Used for UI, body text.
- **Mono:** `JetBrains Mono` (loaded via `next/font/google`). Used for code blocks, technical identifiers.
- **No serif fonts** in Phase 1. May add for editorial content (articles) in Phase 2.

**Line heights:**
- Body: 1.5
- Headings: 1.2
- Code: 1.6

**Letter spacing:**
- Body: normal (0)
- Headings: -0.01em (slightly tighter for large text)
- Small text: 0.01em (slightly looser for readability)

**Implements:** LOCK-10 (premium feel via precise typography).

### AD-04 — Spacing Scale

**Context.** Inconsistent spacing (12px, 14px, 16px, 18px padding) breaks visual rhythm. Tailwind's spacing scale (4px base) provides consistency.

**Decision.** Use Tailwind's default spacing scale:

| Token | Size | Use |
|-------|------|-----|
| `0` | 0 | No spacing |
| `1` | 4px | Tight inline spacing |
| `2` | 8px | Compact element padding |
| `3` | 12px | Small element padding |
| `4` | 16px | Default element padding |
| `6` | 24px | Section internal spacing |
| `8` | 32px | Section spacing |
| `12` | 48px | Page section spacing |
| `16` | 64px | Large page section spacing |
| `24` | 96px | Hero spacing |

**Rules:**
- Use only these values; no `p-[13px]` arbitrary values.
- Spacing between related elements: `2` or `3` (8-12px).
- Spacing within a section: `4` or `6` (16-24px).
- Spacing between sections: `8` or `12` (32-48px).
- Page-level rhythm: multiples of 8px.

**Implements:** LOCK-10 (spacious layout), EC-10 (consistent spacing).

### AD-05 — Border Radius Scale

**Context.** Inconsistent corner radii (4px, 6px, 8px, 12px) look unprofessional.

**Decision.** Radius scale:

| Token | Radius | Use |
|-------|--------|-----|
| `rounded-none` | 0 | Tables, dividers |
| `rounded-sm` | 2px | Small inline elements, badges |
| `rounded-md` | 6px | Inputs, buttons (default) |
| `rounded-lg` | 8px | Cards, modals |
| `rounded-xl` | 12px | Large cards, feature panels |
| `rounded-full` | 9999px | Pills, avatars, circular buttons |

**Rules:**
- Default radius: `rounded-md` (6px).
- Cards: `rounded-lg` (8px) or `rounded-xl` (12px) for emphasis.
- Inputs and buttons: `rounded-md` (6px).
- Never mix radii in a single component (e.g., button with `rounded-lg` inside a `rounded-md` card).

**Implements:** LOCK-10 (consistent component usage).

### AD-06 — Shadow Scale

**Context.** Shadows convey depth. Without a scale, shadows vary wildly.

**Decision.** Shadow scale (subtle, developer-first aesthetic):

| Token | Shadow | Use |
|-------|--------|-----|
| `shadow-none` | none | Flat elements |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation (inputs on focus) |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Floating panels |

**Rules:**
- Default: `shadow-none` (flat aesthetic).
- Use `shadow-sm` for inputs on focus.
- Use `shadow-md` for cards with hover interaction.
- Use `shadow-lg` for modals and popovers.
- Dark mode: shadows are less visible; rely more on border for depth.

**Implements:** LOCK-10 (minimal animation, premium feel via precise elevation).

### AD-07 — Motion and Animation Standards

**Context.** LOCK-10 mandates minimal animation. Excessive motion degrades the developer-first aesthetic and can cause accessibility issues (motion sensitivity).

**Decision.** Motion standards:

**Allowed animations (state-change only):**
- Hover transitions: 150ms ease-out.
- Focus transitions: 100ms ease-out.
- Modal/dialog open: 200ms ease-out.
- Modal/dialog close: 150ms ease-in.
- Toast notifications: 200ms ease-out.

**Forbidden animations:**
- Decorative animations (pulsing, bouncing, rotating for non-loading states).
- Auto-playing carousels.
- Parallax scrolling.
- Animated illustrations.
- Page transition animations (instant page changes preferred).

**Loading states:**
- Skeleton loaders with subtle pulse (1.5s ease-in-out infinite).
- Progress bars for long operations.
- No spinner-only loading states (always skeleton or progress).

**Reduced motion:**
- All animations respect `prefers-reduced-motion: reduce` (EC-06).
- When reduced motion is preferred, animations are instant or replaced with opacity changes.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implements:** LOCK-10 (minimal animation), EC-06 (reduced motion compatibility).

### AD-08 — Layout Grid and Breakpoints

**Context.** Responsive design requires consistent breakpoints. Tailwind's default breakpoints are well-established.

**Decision.** Breakpoints (Tailwind defaults):

| Prefix | Min Width | Use |
|--------|-----------|-----|
| (default) | 0 | Mobile-first baseline (360px+) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

**Container:**
- Max width: `max-w-7xl` (1280px) for most pages.
- Max width: `max-w-4xl` (896px) for article pages (reading width).
- Padding: `px-4` on mobile, `px-6` on `sm:`, `px-8` on `lg:`.
- Centered: `mx-auto`.

**Grid:**
- Use Tailwind's grid utilities (`grid`, `grid-cols-*`, `gap-*`).
- Tool grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- Article grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

**Mobile-first:**
- All components designed for 360px viewport first.
- Use `min-w-*` for minimum sizes, not `max-w-*` for mobile.
- Touch targets minimum 44x44px (WCAG recommendation).

**Implements:** LOCK-10 (mobile-first, responsive), EC-06 (accessibility — touch targets).

### AD-09 — Icon System

**Context.** Mixing icon sources (SVG sprites, icon fonts, custom SVGs) creates inconsistency.

**Decision.** Icon system:
- **Library:** `lucide-react` (consistent with shadcn/ui).
- **Size:** 16px (default), 20px (medium), 24px (large). Use Tailwind `w-4 h-4`, `w-5 h-5`, `w-6 h-6`.
- **Color:** inherits from `currentColor` (use `text-foreground`, `text-muted-foreground`, etc.).
- **Stroke width:** 2px (default).
- **No custom SVGs** unless the icon is not available in lucide-react. Document exceptions in component.
- **No icon fonts.**

**Implements:** EC-10 (Design System Governance — consistent icon source).

### AD-10 — Accessibility Standards

**Context.** EC-06 mandates WCAG AA conformance. Specific standards make this enforceable.

**Decision.** Accessibility standards:

**Color contrast:**
- Body text on background: ≥7:1 (WCAG AAA).
- Large text (≥24px or ≥18.66px bold) on background: ≥4.5:1 (WCAG AA).
- UI components and graphical elements: ≥3:1.
- Verified via automated tooling (Lighthouse CI) and manual review.

**Keyboard navigation:**
- All interactive elements operable via keyboard.
- Logical tab order (follows visual order).
- Visible focus indicator (`focus-visible:` Tailwind classes with `outline-2 outline-offset-2 outline-primary`).
- No keyboard traps.
- Skip-to-content link at top of every page.

**Screen reader support:**
- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`).
- ARIA labels only when semantic HTML insufficient.
- `aria-label` on icon-only buttons.
- `aria-live="polite"` on dynamic content (toasts, alerts).
- `aria-busy` on loading elements.
- Hidden content via `aria-hidden="true"` (not `display: none` if it should be screen-reader accessible).

**Forms:**
- Every input has associated `<label>`.
- Error messages via `aria-describedby` linking to input.
- Required fields marked with `aria-required="true"` and visible indicator.
- Validation errors announced via `aria-live`.

**Reduced motion:**
- Per AD-07. `prefers-reduced-motion` respected.

**Touch targets:**
- Minimum 44x44px on touch devices.
- Adequate spacing between interactive elements.

**Images:**
- All images have `alt` attribute.
- Decorative images: `alt=""` (empty).
- Complex images: `aria-describedby` linking to longer description.

**Implements:** EC-06 (Accessibility First).

### AD-11 — Dark Mode Strategy

**Context.** LOCK-10 mandates dark mode ready from day 1. The strategy must be token-driven (no hardcoded colors) and toggleable.

**Decision.** Dark mode strategy:
- **Token-driven:** All colors via CSS custom properties (AD-01).
- **Class-based theming:** `.dark` class on `<html>` element toggles dark mode.
- **User preference:** Stored in cookie (server-readable for SSR) and localStorage.
- **System preference:** Default to `prefers-color-scheme` if no user preference.
- **No flash of incorrect theme:** Server-rendered `<html>` class based on cookie.

**Implementation:**
```typescript
// src/app/layout.tsx
export async function generateMetadata() {
  // ...
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = document.cookie.match(/theme=(dark|light)/)?.[1]
                  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Implements:** LOCK-10 (Dark/Light mode ready).

### AD-12 — Z-Index Scale

**Context.** Without a z-index scale, values drift and stacking becomes unpredictable.

**Decision.** Z-index scale:

| Token | Value | Use |
|-------|-------|-----|
| `z-0` | 0 | Default |
| `z-10` | 10 | Sticky headers, dropdowns |
| `z-20` | 20 | Sticky sidebars |
| `z-30` | 30 | Modals |
| `z-40` | 40 | Popovers, tooltips |
| `z-50` | 50 | Toast notifications |
| `z-[100]` | 100 | Critical overlays (error boundaries) |

**Rules:**
- Use only these values.
- Never use `z-[9999]` or other arbitrary values.
- Higher z-index = more "on top"; respect the hierarchy.

**Implements:** EC-10 (consistent stacking).

## 4. Design Principles

### P1 — Token-Driven, Always
Every color, spacing, radius, shadow, font size comes from a token. No hardcoded values. This is the foundation of dark mode and theming.

### P2 — Minimal by Default
Start with the minimum viable visual treatment. Add decoration only when it improves usability. LOCK-10 mandates this.

### P3 — Hierarchy Through Contrast, Not Decoration
Visual hierarchy via typography size/weight, spacing, and color contrast — not via decorative elements (borders, gradients, shadows).

### P4 — Accessible by Construction
Accessibility is built into tokens (contrast ratios) and components (semantic HTML, ARIA). Not bolted on later.

### P5 — Consistent Across the Ecosystem
Every tool page, every admin page, every marketing page uses the same tokens and components. The user feels they're in one product, not a patchwork.

### P6 — Performance-Conscious
Minimal CSS, no runtime CSS-in-JS, fonts loaded via `next/font` for optimization. Design choices must not bloat the bundle.

## 5. Design Tokens (Full Reference)

### 5.1 Color Tokens

**Light mode:**
```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;              /* white */
  --foreground: 0 0% 3.9%;              /* near black */

  /* Primary (action) */
  --primary: 0 0% 9%;                   /* near black */
  --primary-foreground: 0 0% 98%;       /* near white */

  /* Secondary (subtle action) */
  --secondary: 0 0% 96.1%;              /* light gray */
  --secondary-foreground: 0 0% 9%;      /* near black */

  /* Muted (de-emphasized) */
  --muted: 0 0% 96.1%;                  /* light gray */
  --muted-foreground: 0 0% 45.1%;       /* medium gray */

  /* Accent (links, highlights) */
  --accent: 221 83% 53%;                /* blue */
  --accent-foreground: 0 0% 98%;        /* near white */

  /* Destructive */
  --destructive: 0 84.2% 60.2%;         /* red */
  --destructive-foreground: 0 0% 98%;   /* near white */

  /* Success */
  --success: 142 71% 45%;               /* green */
  --success-foreground: 0 0% 98%;       /* near white */

  /* Warning */
  --warning: 38 92% 50%;                /* yellow/amber */
  --warning-foreground: 0 0% 9%;        /* near black */

  /* Borders and inputs */
  --border: 0 0% 89.8%;                 /* light gray */
  --input: 0 0% 89.8%;                  /* light gray */
  --ring: 221 83% 53%;                  /* blue (focus ring) */

  /* Charts (for analytics) */
  --chart-1: 221 83% 53%;
  --chart-2: 142 71% 45%;
  --chart-3: 38 92% 50%;
  --chart-4: 0 84% 60%;
  --chart-5: 270 76% 53%;
}
```

**Dark mode:**
```css
.dark {
  --background: 0 0% 3.9%;              /* near black */
  --foreground: 0 0% 98%;               /* near white */

  --primary: 0 0% 98%;                  /* near white */
  --primary-foreground: 0 0% 9%;        /* near black */

  --secondary: 0 0% 14.9%;              /* dark gray */
  --secondary-foreground: 0 0% 98%;     /* near white */

  --muted: 0 0% 14.9%;                  /* dark gray */
  --muted-foreground: 0 0% 63.9%;       /* light gray */

  --accent: 217 91% 60%;                /* lighter blue for dark bg */
  --accent-foreground: 0 0% 98%;        /* near white */

  --destructive: 0 62.8% 30.6%;         /* darker red */
  --destructive-foreground: 0 0% 98%;   /* near white */

  --success: 142 71% 45%;               /* same green */
  --success-foreground: 0 0% 98%;       /* near white */

  --warning: 38 92% 50%;                /* same yellow */
  --warning-foreground: 0 0% 9%;        /* near black */

  --border: 0 0% 14.9%;                 /* dark gray */
  --input: 0 0% 14.9%;                  /* dark gray */
  --ring: 217 91% 60%;                  /* lighter blue */
}
```

### 5.2 Typography Tokens

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| Font sans | `Inter, system-ui, sans-serif` | `font-sans` |
| Font mono | `JetBrains Mono, monospace` | `font-mono` |
| Text xs | 12px / 1rem line-height | `text-xs` |
| Text sm | 14px / 1.25rem | `text-sm` |
| Text base | 16px / 1.5rem | `text-base` |
| Text lg | 18px / 1.75rem | `text-lg` |
| Text xl | 20px / 1.75rem | `text-xl` |
| Text 2xl | 24px / 2rem | `text-2xl` |
| Text 3xl | 30px / 2.25rem | `text-3xl` |
| Text 4xl | 36px / 2.5rem | `text-4xl` |
| Text 5xl | 48px / 1rem | `text-5xl` |

Font weights: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700).

### 5.3 Spacing Tokens

Per AD-04. Tailwind default scale (4px base).

### 5.4 Radius Tokens

Per AD-05. Tailwind defaults: `rounded-sm` (2px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full` (9999px).

### 5.5 Shadow Tokens

Per AD-06. Tailwind defaults: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`.

### 5.6 Motion Tokens

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `fast` | 100ms | ease-out | Focus transitions |
| `normal` | 150ms | ease-out | Hover transitions |
| `slow` | 200ms | ease-out | Modal/dialog open |
| `slower` | 300ms | ease-out | Large element transitions |

Implemented via Tailwind classes: `transition`, `duration-150`, `ease-out`.

### 5.7 Z-Index Tokens

Per AD-12.

## 6. Component Patterns (Overview)

Detailed component APIs in `12_ACD`. This section lists the components in the design system and their purposes.

### 6.1 Primitives (in `@packages/ui`)

| Component | Purpose |
|-----------|---------|
| `Button` | Primary action button |
| `IconButton` | Icon-only button (with `aria-label`) |
| `Input` | Text input |
| `Textarea` | Multi-line text input |
| `Select` | Dropdown select |
| `Checkbox` | Checkbox |
| `RadioGroup` | Radio button group |
| `Switch` | Toggle switch |
| `Slider` | Range slider |
| `Label` | Form label |
| `FormField` | Form field wrapper (label + input + error) |
| `Card` | Container with border and optional shadow |
| `Dialog` / `Modal` | Modal dialog |
| `Sheet` | Slide-out panel |
| `Popover` | Floating content |
| `Tooltip` | Hover tooltip |
| `Toast` | Notification toast |
| `Alert` | Inline alert |
| `Badge` | Small status indicator |
| `Avatar` | User avatar |
| `Tabs` | Tabbed interface |
| `Accordion` | Collapsible sections |
| `Table` | Data table |
| `Progress` | Progress bar |
| `Skeleton` | Loading skeleton |
| `Spinner` | Loading spinner (use sparingly) |
| `Separator` | Horizontal/vertical divider |
| `ScrollArea` | Custom scrollable area |

### 6.2 Composite Components (in `src/shared/components/`)

| Component | Purpose |
|-----------|---------|
| `PageContainer` | Standard page wrapper (max-width, padding) |
| `SectionHeading` | Section heading with optional action |
| `Breadcrumb` | Breadcrumb navigation (LOCK-08) |
| `ThemeToggle` | Light/dark mode toggle |
| `EmptyState` | Empty state illustration + text |
| `ErrorState` | Error state with retry |
| `LoadingState` | Loading state with skeleton |
| `FileDropzone` | File upload dropzone |
| `ToolCard` | Tool card for grid display |
| `ToolGrid` | Grid of ToolCards |
| `FAQ` | FAQ section (LOCK-08) |
| `RelatedTools` | Related tools section (LOCK-08) |

### 6.3 Tool Engine Components

| Component | Purpose |
|-----------|---------|
| `ToolLayout` | Standard tool page layout |
| `ToolInputForm` | Tool configuration form |
| `ToolProcessingProgress` | Processing progress UI |
| `ToolPreview` | Result preview container |
| `ToolDownloadButton` | Download button (with registration gate per LOCK-07) |

## 7. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
```

## 8. Standards

### 8.1 Token Usage Standards
- All colors via tokens (`bg-background`, `text-foreground`, etc.).
- No hardcoded hex values.
- No `style={{ color: '#fff' }}` inline styles.

### 8.2 Component Usage Standards
- Use design system components from `@packages/ui`.
- Compose into higher-level components in `src/shared/components/`.
- Don't reinvent primitives (Button, Input, Card, etc.).

### 8.3 Dark Mode Standards
- Every component works in light and dark mode.
- Test both modes during development.
- No dark-mode-specific code paths; token switching handles it.

### 8.4 Accessibility Standards
- Per AD-10. WCAG AA conformance mandatory.
- Verified via Lighthouse CI (≥95 accessibility score).

### 8.5 Animation Standards
- Per AD-07. Minimal animation.
- Reduced motion respected.

### 8.6 Performance Standards
- No runtime CSS-in-JS.
- Fonts via `next/font`.
- Minimal custom CSS (only `globals.css`).

## 9. Best Practices

### 9.1 When Choosing Colors
1. Use tokens, never hex values.
2. Default to muted/foreground for text.
3. Use primary for actions, accent for highlights.
4. Use semantic colors (success/warning/destructive) only for status.
5. Verify contrast in both light and dark mode.

### 9.2 When Spacing Elements
1. Use Tailwind spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
2. Within a section: 16-24px (`gap-4` or `gap-6`).
3. Between sections: 32-48px (`py-8` or `py-12`).
4. Page padding: 16px mobile, 24-32px desktop.

### 9.3 When Adding a Component
1. Check `@packages/ui` for existing (EC-03).
2. Check `src/shared/components/` for app-specific composite.
3. If new: place in appropriate location per `07_FolderStructure`.
4. Use design tokens, not hardcoded values.
5. Verify dark mode and accessibility.

### 9.4 When Animating
1. Default to no animation.
2. Add animation only for state changes (hover, focus, open/close).
3. Keep duration ≤200ms.
4. Respect `prefers-reduced-motion`.
5. No decorative animations.

### 9.5 When Theming
1. All theming via tokens.
2. To change theme: modify CSS custom properties in `globals.css`.
3. Dark mode: toggle `.dark` class on `<html>`.
4. Test both modes.

## 10. Future Scalability

### 10.1 Adding New Tokens
- New tokens added to `globals.css` and `tailwind.config.ts`.
- Documented in this file's §5 reference.
- ADR if adding a new token category.

### 10.2 Adding New Components
- New primitives added to `@packages/ui`.
- New composites added to `src/shared/components/`.
- Documented in `12_ACD`.

### 10.3 Brand Customization (Phase 4)
- White-label: change CSS custom properties per tenant.
- Token system supports this without code changes.

### 10.4 Multi-Language Support (Phase 2+)
- RTL languages: add `dir="rtl"` support.
- Font swap for CJK languages (Noto Sans SC, etc.).

### 10.5 Storybook (Phase 2+)
- Component documentation and visual testing.
- Storybook stories colocated with components.

## 11. Dependencies

### 11.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4 — LOCK-10, EC-06, EC-10.
- Depends on `04_TechStack` — Tailwind, shadcn/ui, lucide-react.
- Depends on `08_CodingStandards` — Design system compliance rules.
- `06_ArchitectureDecisionRecords` — records AD-01 through AD-12.
- `12_ACD` — Detailed component APIs.
- `13_UDS` — User flows and interaction patterns.

### 11.2 External Dependencies
- Tailwind CSS 4+.
- shadcn/ui (Radix UI primitives).
- lucide-react (icons).
- `next/font` (font optimization).

### 11.3 Assumptions
- Token system remains stable; changes require ADR.
- Tailwind remains the styling framework (no migration to alternatives).

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Design System. Defined token-driven theming via CSS custom properties, monochrome palette with single accent, typography scale, spacing scale, radius scale, shadow scale, motion standards, layout grid, icon system, accessibility standards (WCAG AA), dark mode strategy, z-index scale. Listed component patterns and Tailwind configuration. |

## 13. Cross References

- `00_Project_Charter` §3 LOCK-10, §4 EC-06, EC-10 — Implemented.
- `01_BRD` §3.3 — Brand trust goal supported by consistent design.
- `02_SAD` — Components align with architectural layers.
- `04_TechStack` AD-05, AD-06 — shadcn/ui and Tailwind power this system.
- `06_ArchitectureDecisionRecords` — ADR-010 (Design Philosophy), ADR-018 (Accessibility), ADR-022 (Design System Governance), ADR-040 (shadcn/ui), ADR-041 (Tailwind).
- `07_FolderStructure` — Component file locations.
- `08_CodingStandards` §12 — Design system compliance rules.
- `09_NamingConvention` — CSS class and token naming.
- `11_FBRD` — Tool manifests reference design system components.
- `12_ACD` — Detailed component APIs and contracts.
- `13_UDS` — User flows using these components.
- `16_SEOSpecification` — Open Graph image standards use design tokens.
- `19_AdminSpecification` — Admin UI uses same design system.
- `21_TestingStrategy` — Accessibility and visual testing.
- `22_DeploymentGuide` — Performance monitoring of design choices.
- `23_AI_Guideline` — AI must use design system (LOCK-09, EC-11).
