# MASTER PROMPT — RESPONSIVE UI/UX AUDIT & FIX

I need you to perform a complete responsive UI/UX audit of the entire Weather Dashboard and fix all responsive issues.

The current desktop design is already established and should be preserved. Your job is NOT to redesign the application. Your job is to make the existing UI behave correctly and look polished across different screen sizes.

---

## 1. Main Objective

Make the entire Weather Dashboard fully responsive across:

- Large Desktop
- Desktop
- Laptop
- Tablet
- Small Tablet
- Mobile
- Small Mobile

The application must never have:

- Unexpected horizontal scrolling
- Content overflowing outside its container
- Overlapping components
- Broken grids
- Text clipping
- Buttons going outside the viewport
- Cards becoming unusably small
- Images being distorted
- Modals exceeding the viewport
- Sidebar covering important content
- Header elements colliding
- Charts overflowing their containers

Do not simply hide problematic elements with `display: none` unless that is explicitly appropriate for the mobile UX.

---

# 2. Important Rule — Preserve Existing Desktop Design

The current desktop UI is the visual reference.

Do NOT unnecessarily change:

- Colors
- Typography
- Card design
- Glassmorphism
- Spacing system
- Existing component hierarchy
- Desktop layout
- Existing animations
- Existing functionality

First understand the current layout and component structure, then make the minimum changes necessary to make it responsive.

---

# 3. Responsive Breakpoints

Use a consistent responsive strategy.

At minimum support:
