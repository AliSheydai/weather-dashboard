export interface CurrentWeather {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  feelsLike: number;
  visibility: number;
  uvIndex: number;
  aqi: number;
  aqiStatus: string;
  rainfall: number;
  icon: string;
  sunrise: string;
  sunset: string;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
  timezone: number;
}

export interface HourlyForecast {
  hour: string;
  temperature: number;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  rainfall: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}
