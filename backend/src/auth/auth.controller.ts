import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Cookie settings — shared between login/register and logout */
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true, // JS cannot access this cookie — prevents XSS token theft
  sameSite: 'lax' as const, // Protects against CSRF while allowing navigation
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  path: '/',
  maxAge: 60 * 60 * 24 * 1000, // 24 hours in ms (matches JWT expiry)
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    // Set HttpOnly cookie so middleware and server-side code can read it
    res.cookie('auth_token', result.access_token, AUTH_COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    // Set HttpOnly cookie so middleware and server-side code can read it
    res.cookie('auth_token', result.access_token, AUTH_COOKIE_OPTIONS);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/me — returns the currently authenticated user.
   * Returns 401 if the token is missing or invalid.
   * The backend is the single source of truth here.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request & { user: { id: string; email: string } }) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return req.user;
  }
}
