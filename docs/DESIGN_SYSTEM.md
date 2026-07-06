# IdeaHub Design System - Theme & Color Specifications

This document outlines the professional color system, theme variables, and styling guidelines implemented for IdeaHub.

---

## 1. Theme Architecture & Mechanics

IdeaHub implements a **CSS custom property-driven theme engine**. The application views and layout components consume semantic Tailwind utility classes (e.g. `bg-bg-base`, `text-text-primary`, `border-border-subtle`). The actual values of these classes are mapped to CSS custom variables that dynamically re-evaluate when the `.light` class is added to or removed from the root `<html>` element.

### Theme Switching Behavior
1. **OS Preference Sync**: On first launch, the application checks `window.matchMedia('(prefers-color-scheme: light)').matches` to adapt automatically to the user's operating system preferences.
2. **Local Storage Persistence**: The active theme selection (`light` or `dark`) is stored in `localStorage` under the key `theme`.
3. **No-Refresh Transition**: Changing themes instantly mutates the DOM classes. Transitions are targeted specifically to body, layout containers, cards, tables, and form inputs to prevent layout shifts or lags:
   ```css
   transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
   ```
4. **Single Source of Truth**: The theme toggle resides exclusively in `Topbar.tsx` to maintain unified state across all screens.
5. **Route Page Transitions**: Page layout frames are wrapped in an entry animation container (`.animate-fade-in-up`) keyed to the router pathname, rendering a hardware-accelerated fade-and-slide up on route change.
6. **Keyframe Animations**:
   * `fade-in-up`: Slides elements up by `12px` and opacity fades from `0` to `1` over `450ms`.
   * `float`: Sways decorative shapes/glow elements vertically by `8px` over a `6s` infinite cycle.
7. **Interactive Mouse Parallax**: The Login and Dashboard backgrounds implement cursor-responsive shifting where decorative layers slide at distinct speeds relative to the mouse vector (e.g. grid shifts at `-25px`, glows at `40px` to `50px`, and cards at `12px`), creating a mature sense of 3D depth.

---

## 2. Semantic Color Tokens

We categorize color applications into semantic categories to maintain a clean layout hierarchy:

| Token Name | Tailwind Utility | Dark Theme Code | Light Theme Code | Semantic Intent |
| :--- | :--- | :--- | :--- | :--- |
| **App Background** | `bg-bg-base` | `#030306` | `#F8FAFC` | Primary backdrop for all pages. |
| **Surface** | `bg-bg-surface` | `#111118` | `#FFFFFF` | Core panels, cards, tables, and sidebars. |
| **Elevated Surface** | `bg-bg-elevated` | `#1D1D2B` | `#F1F5F9` | Modals, active inputs, dropdown list overlays. |
| **Primary Text** | `text-text-primary` | `#F5F5F7` | `#0F172A` | Titles, core body text, and active labels. |
| **Secondary Text** | `text-text-secondary` | `#9EA0C2` | `#475569` | Muted descriptions, timestamps, and secondary captions. |
| **Subtle Border** | `border-border-subtle` | `#222233` | `#E2E8F0` | Default visual dividers and border separations. |
| **Strong Border** | `border-border-strong` | `#383857` | `#CBD5E1` | Interactive elements hover borders, input outlines. |

---

## 3. Accent Palette Guidelines

To ensure a calm, professional visual atmosphere, IdeaHub adopts an **Electric Purple / Amethyst** brand accent, used sparingly for primary buttons, selection indicators, and active links. AI-inspired bright neon gradients are prohibited.

* **Dark Mode Accent**: `#a855f7` (Purple 500 - glowing purple)
  * Hover State: `#c084fc` (Purple 400)
  * Transparent / Highlight tint: `rgba(168, 85, 247, 0.15)`
* **Light Mode Accent**: `#9333ea` (Purple 600 - rich purple)
  * Hover State: `#a855f7` (Purple 500)
  * Transparent / Highlight tint: `rgba(147, 51, 234, 0.08)`

Primary call-to-action elements utilize a solid background (`bg-primary hover:bg-primary-hover`) rather than gradients.

---

## 4. Status Colors Guidelines

Status indicators utilize semantic variables that guarantee high WCAG AA text contrast:

| Status | Dark Mode Hex | Light Mode Hex | Light Mode Contrast Adjustment |
| :--- | :--- | :--- | :--- |
| **Success** (Approved / Done) | `#10B981` | `#16A34A` | Darkened for high contrast readability. |
| **Warning** (In Review / Collaborative) | `#F59E0B` | `#D97706` | Darkened to prevent yellow washout. |
| **Danger** (Rejected / Action required) | `#EF4444` | `#DC2626` | Darkened to stand out clearly on white. |
| **Information** (Drafts) | `#3B82F6` | `#2563EB` | Utilizes accent color indicators. |

---

## 5. Buttons Hierarchy & States

Color alone must never be the sole indicator of button interactivity. Ensure appropriate border/color changes and cursor modifications are applied:

1. **Primary Button**: Solid fill background (`bg-primary hover:bg-primary-hover text-white`). Hover triggers color shifts, and active focus triggers blue ring outlines.
2. **Secondary Button**: Outlined layout (`bg-bg-surface border-border-strong text-text-primary`). Hover shifts border highlight to primary blue.
3. **Danger Button**: Crimson highlight (`bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white`).
4. **Ghost Button**: Transparent background (`hover:bg-bg-elevated text-text-secondary hover:text-text-primary`).

---

## 6. Dialogs & Modal Overlays

To maintain visual consistency and prevent blocking browser threads:
1. **No Native Dialogs**: Standard `window.confirm`, `window.alert`, and `prompt` dialogs are prohibited.
2. **Standardized Modals**: All user action confirmations (e.g., deleting drafts, modifying system settings, inviting users) must use styled, relative inline overlay modals.
3. **Modal Structure**:
   * **Overlay Backdrop**: Fullscreen dark backdrop with glassmorphism blur (`fixed inset-0 bg-bg-base/80 backdrop-blur-md`).
   * **Container**: Rounded cards matching standard borders (`bg-bg-surface border border-border-subtle rounded-2xl p-6 glass-card shadow-2xl animate-in zoom-in-95`).
   * **Action Buttons**: Grouped right-aligned with secondary outline cancel buttons on the left and primary colored confirm buttons on the right.

---

## 7. Navigation Layout & State Guidelines

1. **Subtle Highlights**: Active indicators must use semantic tokens (`bg-primary-transparent text-primary font-semibold rounded-xl`) to highlight items. Hardcoded colors are prohibited.
2. **Stability**: Active indicators must never apply layout-shifting borders or margins. Active navigation shifts must remain visually subtle and keep sidebar tabs centered.
3. **Logical Grouping**: Application settings and accounts settings must reside in the bottom group utilities, separating operational workflows (ideas, queues, dashboard) from personal config parameters.

---

## 8. Mobile & Responsive Guidelines

To ensure unified, high-fidelity experience on phone and tablet viewports:
1. **Touch Targets**: All interactive elements (toggles, triggers, buttons, close selectors) must meet a minimum height and width of **40px–44px** on mobile viewports using responsive padding or dimensions (e.g. `w-11 h-11` or `h-10 md:h-[28px]`).
2. **Safe Areas**: Top layout headers and sidebars must clearing mobile status bar notches (`pt-safe`), and bottom pages must clear OS gesture bars (`pb-safe`) by referencing environment-safe variables.
3. **Responsive Table Fallbacks**:
   - For overview statistics lists and dashboard items: stack tabular rows into clean vertical card elements (`block md:hidden`) on viewports under 768px.
   - For directory listings (such as the members grid): wrap tabular layouts in a smooth horizontal overflow scroll wrapper (`overflow-x-auto min-w-[700px]`) to maintain audit detail without layout squishing.
4. **Selective Scrollbars**: Hide scrollbars (`.scrollbar-none`) only on decorative swiping components (like dynamic filter tabs) to prevent aesthetic clutter. Keep default scrollbars visible on scrollable containers.
5. **Modal Viewport Limits**: Overlay modal dialog cards must use a maximum height boundary of `max-h-[90vh]` combined with `overflow-y-auto` and bottom spacing buffers, preventing virtual keyboards from obscuring confirm/cancel actions.
6. **Auto-Closing Drawers**: Mobile drawer overlays must listen to route navigation paths (`location.pathname`) to automatically close themselves, preventing desynchronized drawer states.
