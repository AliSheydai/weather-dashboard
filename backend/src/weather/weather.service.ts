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
    this.apiKey = this.configService.get<string>(
      'WEATHER_API_KEY',
      '371ec30872dff9e2936e074606552d16',
    );
    this.baseUrl = this.configService.get<string>(
      'WEATHER_API_BASE_URL',
      'https://api.openweathermap.org/data/2.5',
    );
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
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        feelsLike: Math.round(data.main.feels_like),
        visibility: Math.round(data.visibility / 1000), // Convert to km
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
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

      // Group by day and get min/max temps
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
          });
        } else {
          const existing = dailyMap.get(date);
          existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
          existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
        }
      });

      return Array.from(dailyMap.values()).map((day) => ({
        ...day,
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp),
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch forecast data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
