export interface CurrentWeather {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
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
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}
