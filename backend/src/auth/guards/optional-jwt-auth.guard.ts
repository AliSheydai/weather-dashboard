import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard: attaches req.user if a valid token is present,
 * but does NOT reject the request if no token is provided.
 * Use this for public endpoints that log extra info when authenticated.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Never throw — just populate req.user if possible
  handleRequest<TUser = any>(_err: any, user: TUser): TUser {
    return user; // user will be undefined/false if not authenticated
  }

  canActivate(context: ExecutionContext) {
    // Attempt JWT validation but swallow all errors
    return super.canActivate(context) as Promise<boolean>;
  }
}
