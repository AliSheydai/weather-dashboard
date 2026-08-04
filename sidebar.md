## Premium Left Sidebar Specification

Design and implement a **premium collapsible left sidebar** for the Weather Dashboard. The sidebar must feel like a modern macOS / Apple Weather / Arc Browser interface and match the existing dark glassmorphism dashboard style.

### Core Behavior

- The sidebar is positioned on the **left side** of the screen.
- It must support **expanded** and **collapsed** states.
- Expanded width: **260–280px**.
- Collapsed width: **72px**.
- Transition: smooth width animation (~250ms ease-in-out).
- The collapse button should remain visible in both states.
- In collapsed mode, show only icons with tooltips on hover.

### Visual Style

- Dark translucent background with backdrop blur.
- Subtle border on the right side.
- Soft inner glow and shadow.
- Rounded corners on internal cards.
- Hover states should gently brighten the background.
- Active item should have a blue glow / highlighted glass effect.

---

# Top Section

### Brand Row

Include:

- Weather app logo icon
- App name “Weather”
- Collapse / expand button

Icons:

- Logo: `CloudSun`
- Toggle: `PanelLeftClose` / `PanelLeftOpen`

---

# Main Navigation

Create a primary navigation group.

| Label     | Icon            |
| --------- | --------------- |
| Dashboard | LayoutDashboard |
| Browse    | Compass         |
| Map       | Map             |
| Metrics   | BarChart3       |

Requirements:

- Active item has a glowing pill background.
- Icons and labels aligned vertically.
- Keyboard focus states included.

---

# Search Section

Add a search input below navigation.

Placeholder:

```
Search city or airport
```

Icon: `Search`

Behavior:

- Search cities in real time.
- Press Enter to open that city dashboard.

---

# Saved Cities Section

Title: **Saved Cities**

Display a scrollable list of saved cities.

Each city item contains:

- City name
- Weather condition
- Current temperature
- Min / Max temperature

Example:

```
New York
Cloudy
22°   H:29° L:15°
```

Requirements:

- Active city highlighted.
- Hover effect with subtle elevation.
- Clicking a city updates the entire dashboard.

Icon for each city: `MapPin`.

---

# Quick Actions Section

Title: **Quick Actions**

Buttons:

1. **Add City** (`Plus`)
2. **Use Current Location** (`LocateFixed`)
3. **Refresh Weather** (`RefreshCw`)

Buttons should use compact glass buttons with icons.

---

# Collections Section

Title: **Collections**

Display thematic city groups.

Items:

- Summer Destinations (`Sun`)
- Rainy Places (`CloudRain`)
- Snow Cities (`Snowflake`)
- Windy Spots (`Wind`)

Clicking a collection filters the Browse view.

---

# Explore Section

Title: **Explore**

Show small statistic rows:

- Hottest City 🔥
- Coldest City ❄️
- Rainiest City 🌧️
- Best Air Quality 🌿

Each row includes city name and value.

---

# Bottom Sticky Section

This section stays pinned to the bottom.

### Live Weather Widget

Compact card:

```
NOW IN BERLIN
24°C
AQI 41
Clear Sky
```

Use a subtle glowing border.

---

# User Profile Section

Display:

- Avatar
- User name
- Email

Click opens a dropdown menu.

Dropdown items:

- Profile (`User`)
- Settings (`Settings`)
- Temperature Unit (`Thermometer`)
- Logout (`LogOut`)

---

# Footer Icons

Bottom utility icons:

- Notifications (`Bell`)

---

# Interaction Details

- Hover city item → background brighten.
- Hover navigation item → slight scale (1.02).
- Collapse/expand → animate labels fading in/out.
- Tooltip appears in collapsed mode.
- Sidebar should not cause layout shift in the main dashboard; the dashboard content should resize smoothly.

---

# Responsive Behavior

### Desktop

Persistent sidebar.

### Tablet

Collapsed by default.

### Mobile

Transform into a **slide-in drawer** opened by a hamburger button.

- Overlay background.
- Swipe-to-close support preferred.
- Close on outside click.

---

# Technical Requirements

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React icons
- Framer Motion for animations
- Zustand for sidebar state management

Suggested store:

```ts
type SidebarState = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};
```

---

# UX Goal

The sidebar must feel like a **weather command center**, not a simple navigation menu. It should provide quick access to locations, discovery features, live weather status, and user actions while maintaining a clean, premium, minimalist aesthetic consistent with the reference dashboard.
