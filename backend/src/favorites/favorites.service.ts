import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private weatherService: WeatherService,
  ) {}

  async addFavorite(userId: string, city: string) {
    const trimmedCity = city.trim();

    // Validate that city exists using WeatherService
    const weather = await this.weatherService.getCurrentWeather(trimmedCity);
    const resolvedCity = weather.city || trimmedCity;

    // Check if city is already in favorites
    const existing = await this.prisma.favoriteCity.findFirst({
      where: {
        userId,
        city: {
          equals: resolvedCity,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('City already in favorites');
    }

    return this.prisma.favoriteCity.create({
      data: { userId, city: resolvedCity },
    });
  }

  async removeFavorite(userId: string, id: string) {
    const favorite = await this.prisma.favoriteCity.findFirst({
      where: { id, userId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favoriteCity.delete({
      where: { id },
    });
  }

  async getFavorites(userId: string) {
    return this.prisma.favoriteCity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
