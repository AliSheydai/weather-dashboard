/**
 * Returns the current local time in the city's timezone as a plain number
 * representing "seconds since epoch in local time".
 * We work entirely in UTC seconds to avoid Date locale issues.
 */
function getNowUtcSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Given a UTC unix timestamp and the city's timezone offset (in seconds),
 * returns the local "hour decimal" (e.g. 14.5 = 14:30 local time).
 */
function utcSecondsToLocalHour(utcSeconds: number, timezoneOffsetSeconds: number): number {
  const localSeconds = utcSeconds + timezoneOffsetSeconds;
  const secondsInDay = localSeconds % 86400;
  // secondsInDay can be negative if we cross midnight going backwards
  const normalized = ((secondsInDay % 86400) + 86400) % 86400;
  return normalized / 3600;
}

function getTimeOfDay(
  sunriseTimestamp: number,
  sunsetTimestamp: number,
  timezone: number
): { isDay: boolean; isSunset: boolean } {
  const nowUtc = getNowUtcSeconds();

  // Convert everything to local hours for a simple, reliable comparison
  const nowLocalHour = utcSecondsToLocalHour(nowUtc, timezone);
  const sunriseLocalHour = utcSecondsToLocalHour(sunriseTimestamp, timezone);
  const sunsetLocalHour = utcSecondsToLocalHour(sunsetTimestamp, timezone);

  // Guard: if sunrise/sunset timestamps are missing or invalid, fall back to
  // a reasonable daytime window (6:00–20:00)
  const useFallback =
    !sunriseTimestamp ||
    !sunsetTimestamp ||
    sunriseTimestamp === 0 ||
    sunsetTimestamp === 0 ||
    sunriseLocalHour >= sunsetLocalHour;

  const isDay = useFallback
    ? nowLocalHour >= 6 && nowLocalHour < 20
    : nowLocalHour >= sunriseLocalHour && nowLocalHour < sunsetLocalHour;

  // Sunset window: 30 minutes before actual sunset, still during the day
  const sunsetWindowStartHour = useFallback
    ? 19.5
    : sunsetLocalHour - 0.5;

  const isSunset = isDay && nowLocalHour >= sunsetWindowStartHour;

  return { isDay, isSunset };
}

function normalizeCondition(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sunny")) return "clear";
  if (c.includes("drizzle")) return "drizzle";
  if (c.includes("rain") || c.includes("shower")) return "rain";
  if (c.includes("snow") || c.includes("sleet") || c.includes("ice") || c.includes("blizzard")) return "snow";
  if (c.includes("thunder") || c.includes("storm")) return "thunder";
  if (
    c.includes("cloud") ||
    c.includes("overcast") ||
    c.includes("mist") ||
    c.includes("fog") ||
    c.includes("haze") ||
    c.includes("smoke") ||
    c.includes("dust") ||
    c.includes("sand")
  )
    return "clouds";
  return "clouds";
}

const WEATHER_BACKGROUNDS: Record<
  string,
  { day: string; night: string; sunset?: string }
> = {
  clear: {
    day: "/weather/sun.jpg",
    night: "/weather/night-clouds.jpg", // no dedicated clear-night image; night-clouds is the closest
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
