import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Extracts JWT from:
 * 1. HttpOnly cookie (auth_token) — used by browser with credentials:include
 * 2. Authorization: Bearer header — used by API clients / backward compat
 */
function extractJwtFromCookieOrHeader(req: Request): string | null {
  // Try cookie first
  if (req?.cookies?.auth_token) {
    return req.cookies.auth_token as string;
  }
  // Fall back to Authorization: Bearer header
  const authHeader = req?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookieOrHeader]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(_req: Request, payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
