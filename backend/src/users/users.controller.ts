import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    // For now, return a mock user until JWT is implemented
    // In Phase 7, this will use the JWT guard to get the actual user
    return {
      id: '1',
      name: 'Ali',
      email: 'ali@example.com',
      avatar: null,
      defaultCity: 'New York',
      temperatureUnit: 'C',
    };
  }
}
