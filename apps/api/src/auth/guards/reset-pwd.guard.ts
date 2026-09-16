import { PWD_RESET_PURPOSE } from '@auth/constants';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Payload verified and injected by `ResetPwdGuard` into `request.user`.
 * `token` holds the raw bearer token so downstream endpoints do not need to
 * re-parse the Authorization header.
 */
export type ResetTokenPayload = {
  email: string;
  sub: string;
  purpose: string;
  token: string;
};

type ResetPwdRequest = Request & {
  user?: ResetTokenPayload;
};

@Injectable()
export class ResetPwdGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ResetPwdRequest>();
    const authorization = request.headers.authorization;

    const secret = this.configService.get<string>('JWT_RESET');
    if (!secret) {
      throw new UnauthorizedException('Reset password secret is not configured');
    }

    // Only the `Bearer` scheme is accepted; anything else is treated as missing.
    const [scheme, token] = authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token is required');
    }

    let payload: ResetTokenPayload;
    try {
      const decoded = await this.jwtService.verifyAsync<ResetTokenPayload>(
        token,
        { secret },
      );
      payload = { ...decoded, token };
    } catch {
      throw new UnauthorizedException('Token expirado o corrupto');
    }

    // Validate the token is meant for password recovery and not a stolen login token.
    // Kept OUTSIDE the try/catch so the specific message is not swallowed by the
    // generic verification error handler.
    if (payload.purpose !== PWD_RESET_PURPOSE || !payload.email) {
      throw new UnauthorizedException('Token inválido para esta acción');
    }

    // Inject the verified user (and the raw token) into the request for Endpoint 3.
    request.user = payload;
    return true;
  }
}