import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateTemperatureUnit(
    id: string,
    temperatureUnit: 'C' | 'F',
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { temperatureUnit },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; temperatureUnit?: 'C' | 'F' },
  ): Promise<User> {
    const updateData: { name?: string; temperatureUnit?: 'C' | 'F' } = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.temperatureUnit !== undefined) {
      updateData.temperatureUnit = data.temperatureUnit;
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}

