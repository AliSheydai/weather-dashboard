import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, city: string) {
    const existing = await this.prisma.favoriteCity.findUnique({
      where: {
        userId_city: { userId, city },
      },
    });

    if (existing) {
      throw new ConflictException('City already in favorites');
    }

    return this.prisma.favoriteCity.create({
      data: { userId, city },
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
