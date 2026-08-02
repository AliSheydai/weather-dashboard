import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WeatherService } from './weather.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherQueryDto } from './dto/weather.dto';
import { ValidationPipe } from '@nestjs/common';
import type { Request } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(
    private weatherService: WeatherService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Get('current')
  async getCurrentWeather(
    @Query(ValidationPipe) query: WeatherQueryDto,
    @Req() req: Request,
  ) {
    await this.logSearchIfAuthenticated(req, query.city);
    return this.weatherService.getCurrentWeather(query.city);
  }

  @Get('hourly')
  async getHourlyForecast(@Query(ValidationPipe) query: WeatherQueryDto) {
    return this.weatherService.getHourlyForecast(query.city);
  }

  @Get('forecast')
  async getDailyForecast(@Query(ValidationPipe) query: WeatherQueryDto) {
    return this.weatherService.getDailyForecast(query.city);
  }

  private async logSearchIfAuthenticated(req: Request, city: string) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return;

      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);

      if (payload?.sub) {
        await this.prisma.searchHistory.create({
          data: {
            userId: payload.sub,
            city,
          },
        });
      }
    } catch {
      // Silently fail if not authenticated
    }
  }
}
