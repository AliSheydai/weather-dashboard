function getLocalTime(timezoneOffsetSeconds: number): Date {
  const now = new Date();
  const utcMs =
    now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcMs + timezoneOffsetSeconds * 1000);
}

function unixToDate(
  unixSeconds: number,
  timezoneOffsetSeconds: number
): Date {
  return new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
}

function getTimeOfDay(
  sunriseTimestamp: number,
  sunsetTimestamp: number,
  timezone: number
): { isDay: boolean; isSunset: boolean } {
  const now = getLocalTime(timezone);
  const sunrise = unixToDate(sunriseTimestamp, timezone);
  const sunset = unixToDate(sunsetTimestamp, timezone);

  const isDay = now >= sunrise && now < sunset;

  const sunsetWindowStart = new Date(sunset.getTime() - 30 * 60 * 1000);
  const isSunset = isDay && now >= sunsetWindowStart && now < sunset;

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
  sunriseTimestamp: number,
  sunsetTimestamp: number,
  timezone: number
): WeatherBackgroundResult {
  const { isDay, isSunset } = getTimeOfDay(
    sunriseTimestamp,
    sunsetTimestamp,
    timezone
  );

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
