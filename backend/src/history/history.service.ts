import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async addToHistory(userId: string, city: string) {
    return this.prisma.searchHistory.create({
      data: {
        userId,
        city,
      },
    });
  }

  async getHistory(userId: string, limit = 10) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: limit,
    });
  }

  async clearHistory(userId: string) {
    return this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
  }
}
