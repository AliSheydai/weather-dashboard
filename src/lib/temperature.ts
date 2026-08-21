export type TemperatureUnit = "C" | "F";

/**
 * Converts a Celsius temperature to the selected unit (°C or °F).
 * Formulas:
 * °C -> °F: Math.round((celsius * 9) / 5 + 32)
 * °C -> °C: Math.round(celsius)
 */
export function convertTemperature(
  celsius: number,
  unit: TemperatureUnit = "C"
): number {
  if (isNaN(celsius) || celsius === null || celsius === undefined) {
    return 0;
  }
  if (unit === "F") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Converts a temperature difference (delta) from Celsius to the selected unit scale.
 * Note: A 1°C difference corresponds to a 1.8°F difference.
 */
export function convertTempDiff(
  diffCelsius: number,
  unit: TemperatureUnit = "C"
): number {
  if (isNaN(diffCelsius) || diffCelsius === null || diffCelsius === undefined) {
    return 0;
  }
  if (unit === "F") {
    return Math.round(diffCelsius * 1.8 * 10) / 10;
  }
  return Math.round(diffCelsius * 10) / 10;
}

/**
 * Formats a Celsius temperature into a string with degree symbol and unit.
 * Example: formatTemperature(22, "F") -> "72°F"
 */
export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit = "C"
): string {
  return `${convertTemperature(celsius, unit)}°${unit}`;
}

/**
 * Formats a temperature value into degree format with unit optionally appended.
 * Example: formatDegree(72) -> "72°"
 */
export function formatDegree(val: number): string {
  return `${Math.round(val)}°`;
}
