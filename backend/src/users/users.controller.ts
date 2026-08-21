import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/user-preferences.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: null,
      defaultCity: 'New York',
      temperatureUnit: user.temperatureUnit || 'C',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  async updatePreferences(
    @Request() req,
    @Body(ValidationPipe) dto: UpdatePreferencesDto,
  ) {
    const user = await this.usersService.updateTemperatureUnit(
      req.user.id,
      dto.temperatureUnit,
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: null,
      defaultCity: 'New York',
      temperatureUnit: user.temperatureUnit,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('temperature-unit')
  async updateTemperatureUnit(
    @Request() req,
    @Body(ValidationPipe) dto: UpdatePreferencesDto,
  ) {
    return this.updatePreferences(req, dto);
  }
}

