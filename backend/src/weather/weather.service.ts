import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');
    if (!apiKey) {
      throw new Error('WEATHER_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = this.configService.get<string>(
      'WEATHER_API_BASE_URL',
      'https://api.openweathermap.org/data/2.5',
    );
  }

  async reverseGeocode(lat: number, lon: number): Promise<{ city: string }> {
    try {
      // OWM Geocoding API — returns the most accurate city for the given coordinates
      const url = `https://api.openweathermap.org/geo/1.0/reverse`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            lat,
            lon,
            limit: 1,
            appid: this.apiKey,
          },
        }),
      );

      const results = response.data;
      if (!Array.isArray(results) || results.length === 0) {
        throw new HttpException(
          'Could not determine city from coordinates',
          HttpStatus.NOT_FOUND,
        );
      }

      const city = results[0].name as string;
      if (!city) {
        throw new HttpException(
          'Could not determine city from coordinates',
          HttpStatus.NOT_FOUND,
        );
      }

      return { city };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Reverse geocoding failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getCurrentWeather(city: string) {
    try {
      const url = `${this.baseUrl}/weather`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
          },
        }),
      );

      const data = response.data;
      const lat = data.coord.lat;
      const lon = data.coord.lon;

      // Derive wind direction from degrees
      const windDeg = data.wind.deg ?? 0;
      const windDirection = this.degToCompass(windDeg);

      // Fetch additional data in parallel: air pollution, UV, and rainfall from forecast
      const [aqiResult, uvResult, rainfall] = await Promise.all([
        this.getAirQuality(lat, lon),
        this.getUVIndex(lat, lon),
        this.getRainfallFromForecast(city),
      ]);

      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection,
        feelsLike: Math.round(data.main.feels_like),
        visibility: Math.round(data.visibility / 1000), // Convert to km
        uvIndex: uvResult,
        aqi: aqiResult.aqi,
        aqiStatus: aqiResult.status,
        rainfall,
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        sunriseTimestamp: data.sys.sunrise,
        sunsetTimestamp: data.sys.sunset,
        timezone: data.timezone,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('City not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to fetch weather data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async getAirQuality(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/air_pollution`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { lat, lon, appid: this.apiKey },
        }),
      );

      const aqi = response.data.list[0].main.aqi; // 1-5 scale
      // Convert OWM 1-5 scale to a more standard 0-500 AQI approximation
      const aqiScaled = this.scaleAqi(aqi);
      const status = this.getAqiStatus(aqiScaled);

      return { aqi: aqiScaled, status };
    } catch {
      return { aqi: 0, status: 'Unavailable' };
    }
  }

  private async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      // OpenWeatherMap UV endpoint (One Call API 3.0 or uvi endpoint)
      const url = `${this.baseUrl}/uvi`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { lat, lon, appid: this.apiKey },
        }),
      );
      return Math.round(response.data.value ?? 0);
    } catch {
      // UV endpoint may not be available on all API plans — fall back gracefully
      return 0;
    }
  }

  private async getRainfallFromForecast(city: string): Promise<number> {
    try {
      const url = `${this.baseUrl}/forecast`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
            cnt: 8, // 24 hours (3-hour intervals)
          },
        }),
      );

      // Sum rainfall over the last 24h of forecast entries
      let total = 0;
      for (const item of response.data.list) {
        total += item.rain?.['3h'] ?? 0;
      }
      return Math.round(total * 10) / 10; // 1 decimal place
    } catch {
      return 0;
    }
  }

  private degToCompass(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  private scaleAqi(owmAqi: number): number {
    // OWM uses 1-5 (Good, Fair, Moderate, Poor, Very Poor)
    // Map to approximate 0-500 scale
    const map: Record<number, number> = {
      1: 50,
      2: 100,
      3: 150,
      4: 200,
      5: 300,
    };
    return map[owmAqi] ?? 0;
  }

  private getAqiStatus(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  async getHourlyForecast(city: string) {
    try {
      const url = `${this.baseUrl}/forecast`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
            cnt: 8, // 8 * 3-hour intervals = 24 hours
          },
        }),
      );

      return response.data.list.map((item) => ({
        hour: new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        windDirection: this.degToCompass(item.wind.deg ?? 0),
        visibility: Math.round((item.visibility ?? 10000) / 1000),
        rainfall: Math.round((item.rain?.['3h'] ?? 0) * 10) / 10,
        feelsLike: Math.round(item.main.feels_like),
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch forecast data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getDailyForecast(city: string) {
    try {
      const url = `${this.baseUrl}/forecast`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
          },
        }),
      );

      // Group 3-hour entries by day
      const dailyMap = new Map();
      response.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', {
          weekday: 'short',
        });
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            day: date,
            minTemp: item.main.temp_min,
            maxTemp: item.main.temp_max,
            condition: item.weather[0].main,
            icon: item.weather[0].icon,
            // Accumulate for averages
            _humiditySum: item.main.humidity,
            _windSpeedSum: item.wind.speed * 3.6, // m/s → km/h
            _windDegSum: item.wind.deg ?? 0,
            _visibilitySum: (item.visibility ?? 10000) / 1000, // m → km
            _rainSum: item.rain?.['3h'] ?? 0,
            _count: 1,
          });
        } else {
          const existing = dailyMap.get(date);
          existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
          existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
          existing._humiditySum += item.main.humidity;
          existing._windSpeedSum += item.wind.speed * 3.6;
          existing._windDegSum += item.wind.deg ?? 0;
          existing._visibilitySum += (item.visibility ?? 10000) / 1000;
          existing._rainSum += item.rain?.['3h'] ?? 0;
          existing._count += 1;
        }
      });

      return Array.from(dailyMap.values()).map((day) => ({
        day: day.day,
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp),
        condition: day.condition,
        icon: day.icon,
        humidity: Math.round(day._humiditySum / day._count),
        windSpeed: Math.round(day._windSpeedSum / day._count),
        windDirection: this.degToCompass(Math.round(day._windDegSum / day._count)),
        visibility: Math.round(day._visibilitySum / day._count),
        rainfall: Math.round(day._rainSum * 10) / 10,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch forecast data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
