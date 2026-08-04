# Smart Weather Background for Main Temperature Card

I want the **Main Temperature Card** to have a **dynamic and intelligent background image** that changes automatically based on the current weather condition and time of day.

## Goal

Use the weather data received from the Weather API to select the most appropriate background image so that the card visually reflects the current weather and time (day, sunset, or night).

## Available Images

All images are located in:

`public/weather`

Available files:

- `sun.jpg` → Sunny daytime
- `Sunset.jpg` → Sunset / golden hour / near night with a red-orange sky
- `day-clouds.jpg` → Cloudy daytime
- `night-clouds.jpg` → Cloudy night
- `rany-day.jpg` → Rainy daytime
- `rany-night.jpg` → Rainy night
- `snow-day.jpg` → Snowy daytime
- `snow-night.jpg` → Snowy night

## Background Selection Logic

Use the API response to determine both the **weather type** and whether it is **day or night**.

### 1. Detect Day or Night

Use fields such as `sunrise`, `sunset`, and the current local time.

- If current time is between sunrise and sunset → **day**
- Otherwise → **night**

### 2. Detect Sunset

If the current time is approximately **30–60 minutes before sunset**, display `Sunset.jpg` even when the weather is clear.

### 3. Weather Mapping

- **Clear + day** → `sun.jpg`
- **Clear + sunset window** → `Sunset.jpg`
- **Clouds + day** → `day-clouds.jpg`
- **Clouds + night** → `night-clouds.jpg`
- **Rain / Drizzle + day** → `rany-day.jpg`
- **Rain / Drizzle + night** → `rany-night.jpg`
- **Snow + day** → `snow-day.jpg`
- **Snow + night** → `snow-night.jpg`

If the weather condition is unknown, fall back to the closest cloudy image.

## UI / Design Requirements

- The image must fully cover the card (`background-size: cover`).
- Center the image (`background-position: center`).
- Preserve the card border radius and prevent image overflow (`overflow: hidden`).
- Add a smooth transition when the background changes (around 300ms).

## Readability Overlay

Place a semi-transparent dark overlay above the image to ensure all text remains readable.

Suggested values:

- Day: `rgba(0,0,0,0.25)`
- Night: `rgba(0,0,0,0.45)`

Increase overlay opacity slightly if the selected image is very bright.

## Text Readability

All card content (temperature, city name, weather description, date, high/low temperature, and any additional information) must maintain strong contrast against the background image at all times.

## Technical Requirements

- Load images from the `/weather/...` public path.
- Implement the selection logic in a reusable helper function, for example:

`getWeatherBackground(weatherCode, isDay, isSunset)`

- Use real API values for weather conditions; do not hardcode a single weather state.
- Ensure the implementation is fully compatible with the existing **Next.js App Router** project structure.

## Expected Result

The Main Temperature Card should automatically display the correct background image according to the real weather condition and local time, creating a modern, immersive, and professional weather-app experience similar to high-quality commercial weather applications.
