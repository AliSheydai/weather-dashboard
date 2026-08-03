## Premium Weather Dashboard UI/UX Specification

Recreate the Weather Dashboard so it visually resembles the attached reference image as closely as possible. The goal is a **premium, cinematic, Apple-style weather dashboard**, not a generic admin panel.

### Overall Layout

- The entire dashboard must fit within a **single viewport** on a desktop screen (1920×1080) with **no vertical or horizontal scrolling**.
- Use a **fixed-height dashboard layout** that scales proportionally to the viewport.
- Maintain generous spacing, consistent alignment, and a clean visual hierarchy.

### Visual Style

- Use a **dark glassmorphism aesthetic** similar to the reference image.
- Cards: semi-transparent dark surfaces with soft borders, backdrop blur, rounded corners, and subtle shadows.
- Typography should feel premium: large temperature display, medium section titles, small secondary metadata.

---

## Main Weather Section

The **Current Temperature card and the Daily Forecast card must be merged into one unified component**, exactly like the reference image.

This component should include:

- Current temperature (large and dominant)
- Weather condition text
- Hourly forecast row
- Daily forecast list
- Left and right navigation buttons for switching the selected day

### Day Navigation Behavior

- Clicking the left/right buttons changes the selected day.
- The entire dashboard (temperature, details, forecast, metrics) must update to reflect the selected day.
- Transitions should be smooth (fade + slide animation).

---

## Metrics Cards Grid

Display detailed weather metrics in a **uniform grid of cards** matching the proportions of the reference image.

Include cards such as:

- UV Index
- Sunrise / Sunset
- Visibility
- Feels Like
- Average Temperature
- Rainfall
- Wind
- Air Quality
- Humidity

### Card Requirements

- Consistent width and height
- Identical padding and typography scale
- Small icon in the top-left corner
- Main value emphasized
- Supporting description below
- A **"Show More"** button aligned at the bottom

### Show More Interaction

- Clicking "Show More" must open a **shadcn/ui Dialog modal**.
- The modal should animate smoothly (fade + scale).
- Include additional charts, descriptions, and detailed statistics.
- Prevent background scrolling while the modal is open.

---

## Weekly Forecast Section

The **Weekly Forecast** card must closely match the dimensions and proportions of the reference image.

Requirements:

- 7-day forecast list
- Day name, weather icon, min/max temperature
- Temperature range bar
- Compact vertical spacing so the entire card fits within the viewport

---

## Sidebar

Create a left sidebar similar to the reference image:

- Search input at the top
- List of cities with temperature and weather condition
- Active city highlighted with a glowing or brighter glass effect
- Bottom utility actions (Edit / Settings icons)

The sidebar should have a fixed width and remain fully visible without scrolling.

---

## Header

Top header should include:

- Navigation pills: Browse, Map, Metrics
- Right-side utility icons (settings, search, etc.)
- Active tab styled as a rounded highlighted pill.

---

## Motion & Interactions

Use subtle premium animations:

- Card hover: slight lift + brighter border
- Tab switch: smooth pill movement
- Day switch: fade/slide transition
- Modal open/close: scale + fade
- Sidebar item hover: gentle highlight

Avoid flashy or exaggerated animations.

---

## Technical Requirements

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion for animations
- Responsive behavior for desktop, tablet, and mobile

---

## Critical Constraints

- No page scrolling on desktop.
- No overflowing cards.
- Keep the exact visual balance of the reference image.
- Prioritize **layout fidelity, spacing, and proportions** over adding extra features.
- The final result should feel like a polished production weather application rather than a dashboard template.

Use the attached image as the primary visual reference for spacing, proportions, card sizing, and overall atmosphere.
