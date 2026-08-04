function parseTimeToToday(timeStr: string): Date {
  const now = new Date();
  if (!timeStr || typeof timeStr !== "string") {
    return new Date(0);
  }

  const trimmed = timeStr.trim();
  const parts = trimmed.split(" ");

  if (parts.length === 2) {
    const [time, period] = parts;
    const [hours, minutes] = time.split(":").map(Number);
    let h = hours;
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, minutes, 0);
  }

  // 24h format fallback
  const [hours, minutes] = trimmed.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return new Date(0);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

function getTimeOfDay(
  sunrise: string,
  sunset: string
): { isDay: boolean; isSunset: boolean } {
  const now = new Date();
  const sunriseDate = parseTimeToToday(sunrise);
  const sunsetDate = parseTimeToToday(sunset);

  const isDay = now >= sunriseDate && now < sunsetDate;

  const sunsetWindowStart = new Date(sunsetDate.getTime() - 30 * 60 * 1000);
  const isSunset = isDay && now >= sunsetWindowStart && now < sunsetDate;

  return { isDay, isSunset };
}

function normalizeCondition(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sunny")) return "clear";
  if (c.includes("drizzle")) return "drizzle";
  if (c.includes("rain") || c.includes("shower")) return "rain";
  if (c.includes("snow") || c.includes("sleet") || c.includes("ice")) return "snow";
  if (c.includes("thunder")) return "thunder";
  if (c.includes("cloud") || c.includes("overcast") || c.includes("mist") || c.includes("fog"))
    return "clouds";
  return "clouds";
}

const WEATHER_BACKGROUNDS: Record<
  string,
  { day: string; night: string; sunset?: string }
> = {
  clear: {
    day: "/weather/sun.jpg",
    night: "/weather/night-clouds.jpg",
    sunset: "/weather/Sunset.jpg",
  },
  clouds: {
    day: "/weather/day-clouds.jpg",
    night: "/weather/night-clouds.jpg",
  },
  rain: {
    day: "/weather/rany-day.jpg",
    night: "/weather/rany-night.jpg",
  },
  drizzle: {
    day: "/weather/rany-day.jpg",
    night: "/weather/rany-night.jpg",
  },
  snow: {
    day: "/weather/snow-day.jpg",
    night: "/weather/snow-night.jpg",
  },
  thunder: {
    day: "/weather/rany-day.jpg",
    night: "/weather/rany-night.jpg",
  },
};

export interface WeatherBackgroundResult {
  image: string;
  isDay: boolean;
  isSunset: boolean;
}

export function getWeatherBackground(
  condition: string,
  sunrise: string,
  sunset: string
): WeatherBackgroundResult {
  const { isDay, isSunset } = getTimeOfDay(sunrise, sunset);

  const key = normalizeCondition(condition);
  const entry = WEATHER_BACKGROUNDS[key] ?? WEATHER_BACKGROUNDS.clouds;

  let image: string;
  if (isSunset && entry.sunset) {
    image = entry.sunset;
  } else if (isDay) {
    image = entry.day;
  } else {
    image = entry.night;
  }

  return { image, isDay, isSunset };
}
