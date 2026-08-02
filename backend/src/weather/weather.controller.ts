import { Controller, Get, Query, Req } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(
    private weatherService: WeatherService,
    private prisma: PrismaService,
  ) {}

  @Get('current')
  async getCurrentWeather(@Query('city') city: string, @Req() req: Request) {
    // Try to log search if user is authenticated
    await this.logSearchIfAuthenticated(req, city);
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

  private async logSearchIfAuthenticated(req: Request, city: string) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return;

      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret',
      );

      if (payload?.sub) {
        await this.prisma.searchHistory.create({
          data: {
            userId: payload.sub,
            city: city,
          },
        });
      }
    } catch {
      // Silently fail if not authenticated
    }
  }
}
