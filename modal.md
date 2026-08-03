## Advanced Metrics Modal Specification (Show More Dialogs)

Enhance the **Metrics** section so that each card opens a rich analytical modal when the user clicks **Show More**. The dashboard itself must remain minimal and uncluttered; all advanced visualizations belong inside the modal.

### Global Modal Requirements

- Use **shadcn/ui Dialog** for all modals.
- Animate with **Framer Motion** (fade + scale).
- Modal width: `max-w-4xl`.
- Dark glassmorphism theme consistent with the dashboard.
- Layout inside each modal:
  1. Header (title + current value + status badge)
  2. Primary chart
  3. Secondary insights / mini charts
  4. Statistics grid
  5. AI-style weather insight text

- Use **Recharts** for all charts.
- Tooltips, hover states, and smooth transitions are required.
- Use the currently selected dashboard day as the data source.

---

# 1. UV INDEX

### Primary Chart

- **Gauge / Semi-circle radial chart**
- Color zones:
  - Green: 0–2
  - Yellow: 3–5
  - Orange: 6–7
  - Red: 8–10
  - Purple: 11+

### Secondary Chart

- **24-hour line chart** of UV index across the day.

### Statistics

- Current UV
- Peak UV time
- Daily maximum
- Safe outdoor duration estimate

### Insight Text

Example: "UV levels remain low for most of the day; outdoor activity is safest before noon."

---

# 2. SUNRISE / SUNSET

### Primary Visualization

- **Horizontal daylight timeline**
- Show:
  - Sunrise
  - Solar noon
  - Sunset
  - Current time marker

### Secondary Chart

- **Daylight duration comparison bar chart** for the next 7 days.

### Statistics

- Sunrise time
- Sunset time
- Daylight duration
- Change from yesterday (+/- minutes)

### Interaction

Hovering the timeline shows exact timestamps.

---

# 3. WIND

### Primary Chart

- **Wind Rose chart** (direction frequency distribution).

### Secondary Charts

- **Line chart**: wind speed by hour.
- **Area chart**: gust speed by hour.

### Statistics

- Current speed
- Gust speed
- Dominant direction
- Daily average speed

### Interaction

Hovering a sector highlights the dominant wind direction.

---

# 4. HUMIDITY

### Primary Chart

- **Area chart** showing humidity throughout the day.

### Secondary Chart

- **Comfort zone band** (30–60%) overlaid on the chart.

### Statistics

- Current humidity
- Daily minimum
- Daily maximum
- Average humidity

### Insight

Explain whether the air feels dry, comfortable, or humid.

---

# 5. FEELS LIKE

### Primary Chart

- **Dual line chart** comparing:
  - Actual temperature
  - Feels-like temperature

### Highlight

Shade periods where the difference exceeds ±3°C.

### Statistics

- Current feels-like
- Maximum difference today
- Minimum difference today
- Average difference

### Insight

Explain whether wind or humidity is driving the perceived temperature.

---

# 6. VISIBILITY

### Primary Chart

- **Line chart** of visibility distance across 24 hours.

### Secondary Visualization

- **Radial visibility gauge** with labels:
  - Poor
  - Moderate
  - Good
  - Excellent

### Statistics

- Current visibility
- Daily minimum
- Daily maximum
- Fog risk indicator

### Insight

Mention whether visibility is suitable for driving, aviation, or outdoor activities.

---

# 7. AIR QUALITY

### Primary Chart

- **Radial AQI gauge** with EPA color categories.

### Secondary Chart

- **Stacked bar chart** showing pollutant contribution:
  - PM2.5
  - PM10
  - NO₂
  - O₃
  - SO₂
  - CO

### Statistics

- AQI value
- Category
- Dominant pollutant
- Health recommendation

### Interaction

Hovering bars shows pollutant concentration and unit.

---

# 8. RAINFALL

### Primary Chart

- **Bar chart** of hourly precipitation (mm).

### Secondary Chart

- **7-day cumulative rainfall line chart**.

### Statistics

- Rain today
- Peak rainfall hour
- Probability of precipitation
- Weekly accumulation

### Insight

Example: "Most rainfall is expected between 14:00 and 17:00."

---

# 9. AVERAGE TEMPERATURE(this case is not exist can you get with api?)

### Primary Chart

- **7-day line chart** of daily average temperature.

### Secondary Chart

- **Deviation-from-seasonal-average bar chart**.

### Statistics

- Today’s average
- Weekly average
- Seasonal average
- Difference from seasonal average

### Insight

Explain whether temperatures are above or below normal for the season.

---

# Shared Visual Rules

- Chart corners rounded.
- Use subtle gradients instead of solid fills.
- Avoid bright saturated colors; use muted premium tones.
- Keep chart heights between 220–280px.
- Ensure all charts are readable on dark backgrounds.

---

# Bonus Interaction

Add a **Time Range segmented control** at the top-right of each modal:

- 24H
- 7D
- 30D

Charts should update smoothly when the range changes.

---

# Accessibility

- Keyboard focus trapped inside the dialog.
- Escape closes the modal.
- All charts include accessible labels and tooltips.
- Color is never the sole indicator; include text labels.

The goal is to make each modal feel like a **mini weather analytics workstation** while preserving a clean, minimalist dashboard on the main screen.
