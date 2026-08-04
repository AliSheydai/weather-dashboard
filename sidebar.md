## Replace the Current content shadcn Sidebar with a Weather-App Sidebar content

The current left sidebar was copied from a shadcn demo and still contains unrelated items such as **Playground, Models, Documentation, Settings, Projects, Travel**, etc. Remove **all demo content** and replace it with a sidebar that is fully dedicated to the Weather Dashboard application.

### Important

- Keep the existing shadcn sidebar component structure and animations.
- Keep the dark glassmorphism visual style.
- Replace only the content, icons, labels, grouping, and behavior.
- close/open button is hide. fix it. Because the header covers it.

---

# Final Sidebar Content (Top to Bottom)

## 1. Brand Section

Display at the top:

- Weather app logo icon
- App name: **Weather**
- Collapse / expand button

Use Lucide icons:

- `CloudSun`
- `PanelLeftClose`
- `PanelLeftOpen`

The brand row should stay visible in both expanded and collapsed states.

---

# 2. Primary Navigation

Show these navigation items in this exact order:

| Label     | Icon            |
| --------- | --------------- |
| Dashboard | LayoutDashboard |
| Browse    | Compass         |
| Map       | Map             |
| Metrics   | BarChart3       |

Requirements:

- Dashboard is active by default.
- Active item has a glowing pill background.
- Clicking an item navigates to the corresponding page or tab.

---

# 4. Quick Actions

Title: **Quick Actions**

Render three compact action buttons:

1. **Add City** (`Plus`)
2. **Use Current Location** (`LocateFixed`)
3. **Refresh Weather** (`RefreshCw`)

Buttons should be icon + label buttons with glass styling.

---

# 5. Collections

Title: **Collections**

Show thematic weather collections:

- Summer Destinations (`Sun`)
- Rainy Places (`CloudRain`)
- Snow Cities (`Snowflake`)
- Windy Spots (`Wind`)

Clicking a collection filters the Browse page.

---

# 6. Explore

Title: **Explore**

Show dynamic weather highlights:

- 🔥 Hottest City
- ❄️ Coldest City
- 🌧️ Rainiest City
- 🌿 Best Air Quality

Each row should display the city name and its value.

---

# 7. Live Weather Widget (Sticky Bottom)

Add a compact always-visible weather widget near the bottom:

```text
NOW IN BERLIN
24°C
AQI 41
Clear Sky
```

Style:

- Small glass card
- Subtle glowing border
- Rounded corners

This widget should remain visible even when the sidebar scrolls.

---

# 8. User Section (use user-nav.tsx component and it should be active login and logout)

Display:

- User avatar
- User name
- User email

Clicking the section opens a dropdown menu with:

- Profile (`User`)
- Settings (`Settings`)
- Temperature Unit (`Thermometer`)
- Logout (`LogOut`)

---

# Items That Must Be Removed Completely

Delete these sections and all their children:

- Platform
- Playground
- History
- Starred
- Models
- Genesis
- Explorer
- Quantum
- Documentation
- Tutorials
- Changelog
- Settings (demo section)
- General
- Team
- Billing
- Limits
- Projects
- Design Engineering
- Sales & Marketing
- Travel
- More

No placeholder or empty group should remain.

---

# Collapsed State

When the sidebar is collapsed:

- Show only icons.
- Keep tooltips for every item.
- Keep the live weather widget hidden.
- Keep the collapse button visible.

---

# Final Goal

The finished sidebar must look like a **professional weather application control center**, providing navigation, search, saved locations, discovery features, live weather status, and user actions. It should no longer resemble a shadcn demo sidebar in any way.
