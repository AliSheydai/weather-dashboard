import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'WEATHER_API_KEY') return 'test-api-key';
      if (key === 'WEATHER_API_BASE_URL') return 'https://api.openweathermap.org/data/2.5';
      return undefined;
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    const mockApiResponse: AxiosResponse = {
      data: {
        name: 'Berlin',
        main: { temp: 22.5, humidity: 65, feels_like: 21.0 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 5.0 },
        visibility: 10000,
        sys: { sunrise: 1693632000, sunset: 1693682400 },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    it('should return formatted weather data for a valid city', async () => {
      mockHttpService.get.mockReturnValue(of(mockApiResponse));

      const result = await service.getCurrentWeather('Berlin');

      expect(result).toEqual({
        city: 'Berlin',
        temperature: 23,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 65,
        windSpeed: 18,
        feelsLike: 21,
        visibility: 10,
        icon: '01d',
        sunrise: expect.any(String),
        sunset: expect.any(String),
      });
    });

    it('should call API with correct parameters', async () => {
      mockHttpService.get.mockReturnValue(of(mockApiResponse));

      await service.getCurrentWeather('Berlin');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            q: 'Berlin',
            appid: 'test-api-key',
            units: 'metric',
          },
        },
      );
    });

    it('should throw NotFoundException for 404 response', async () => {
      const error = new AxiosError();
      (error as any).response = { status: 404 };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getCurrentWeather('InvalidCity')).rejects.toThrow(
        new HttpException('City not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BadGatewayException for other errors', async () => {
      const error = new AxiosError();
      (error as any).response = { status: 500 };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getCurrentWeather('Berlin')).rejects.toThrow(
        new HttpException('Failed to fetch weather data', HttpStatus.BAD_GATEWAY),
      );
    });
  });

  describe('getHourlyForecast', () => {
    const mockForecastResponse: AxiosResponse = {
      data: {
        list: [
          {
            dt: 1693632000,
            main: { temp: 20 },
            weather: [{ main: 'Clouds', icon: '02d' }],
          },
          {
            dt: 1693642800,
            main: { temp: 22 },
            weather: [{ main: 'Clear', icon: '01d' }],
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    it('should return formatted hourly forecast', async () => {
      mockHttpService.get.mockReturnValue(of(mockForecastResponse));

      const result = await service.getHourlyForecast('Berlin');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        hour: expect.any(String),
        temperature: 20,
        condition: 'Clouds',
        icon: '02d',
      });
    });

    it('should throw BadGatewayException on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      await expect(service.getHourlyForecast('Berlin')).rejects.toThrow(
        new HttpException('Failed to fetch forecast data', HttpStatus.BAD_GATEWAY),
      );
    });
  });

  describe('getDailyForecast', () => {
    const mockForecastResponse: AxiosResponse = {
      data: {
        list: [
          {
            dt: 1693632000,
            main: { temp_min: 15, temp_max: 25 },
            weather: [{ main: 'Clear', icon: '01d' }],
          },
          {
            dt: 1693642800,
            main: { temp_min: 14, temp_max: 26 },
            weather: [{ main: 'Clouds', icon: '02d' }],
          },
          {
            dt: 1693718400,
            main: { temp_min: 16, temp_max: 24 },
            weather: [{ main: 'Rain', icon: '10d' }],
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    it('should return grouped daily forecast with min/max temps', async () => {
      mockHttpService.get.mockReturnValue(of(mockForecastResponse));

      const result = await service.getDailyForecast('Berlin');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((day) => {
        expect(day).toHaveProperty('day');
        expect(day).toHaveProperty('minTemp');
        expect(day).toHaveProperty('maxTemp');
        expect(day).toHaveProperty('condition');
        expect(day).toHaveProperty('icon');
        expect(typeof day.minTemp).toBe('number');
        expect(typeof day.maxTemp).toBe('number');
      });
    });

    it('should throw BadGatewayException on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      await expect(service.getDailyForecast('Berlin')).rejects.toThrow(
        new HttpException('Failed to fetch forecast data', HttpStatus.BAD_GATEWAY),
      );
    });
  });
});
