import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Post()
  async addFavorite(@Request() req, @Body('city') city: string) {
    return this.favoritesService.addFavorite(req.user.id, city);
  }

  @Delete(':id')
  async removeFavorite(@Request() req, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(req.user.id, id);
  }
}
