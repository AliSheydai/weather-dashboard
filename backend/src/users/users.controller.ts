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
import { UpdateProfileDto } from './dto/update-profile.dto';

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
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(req.user.id, dto);
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
  @Patch('me')
  async updateMe(
    @Request() req,
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    return this.updateProfile(req, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  async updatePreferences(
    @Request() req,
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    if (dto.name !== undefined) {
      return this.updateProfile(req, dto);
    }
    const user = await this.usersService.updateTemperatureUnit(
      req.user.id,
      dto.temperatureUnit || 'C',
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



