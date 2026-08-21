import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherQueryDto } from './dto/weather.dto';
import { GeocodeQueryDto } from './dto/geocode.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

@Controller('weather')
export class WeatherController {
  constructor(
    private weatherService: WeatherService,
    private prisma: PrismaService,
  ) {}

  @Get('current')
  @UseGuards(OptionalJwtAuthGuard)
  async getCurrentWeather(
    @Query(ValidationPipe) query: WeatherQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Log search for authenticated users — req.user is set by OptionalJwtAuthGuard
    if (req.user?.id) {
      await this.prisma.searchHistory.create({
        data: { userId: req.user.id, city: query.city },
      }).catch(() => {
        // Silently fail — search history is non-critical
      });
    }
    return this.weatherService.getCurrentWeather(query.city);
  }

  @Get('geocode')
  async reverseGeocode(@Query(ValidationPipe) query: GeocodeQueryDto) {
    return this.weatherService.reverseGeocode(query.lat, query.lon);
  }

  @Get('hourly')
  async getHourlyForecast(@Query(ValidationPipe) query: WeatherQueryDto) {
    return this.weatherService.getHourlyForecast(query.city);
  }

  @Get('forecast')
  async getDailyForecast(@Query(ValidationPipe) query: WeatherQueryDto) {
    return this.weatherService.getDailyForecast(query.city);
  }
}

