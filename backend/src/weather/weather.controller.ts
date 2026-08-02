import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get('current')
  async getCurrentWeather(@Query('city') city: string) {
    return this.weatherService.getCurrentWeather(city);
  }

  @Get('hourly')
  async getHourlyForecast(@Query('city') city: string) {
    return this.weatherService.getHourlyForecast(city);
  }

  @Get('forecast')
  async getDailyForecast(@Query('city') city: string) {
    return this.weatherService.getDailyForecast(city);
  }
}
