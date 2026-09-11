import { PWD_RESET_PURPOSE } from '@auth/constants';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetPwdGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    const secret = this.configService.get<string>('JWT_RESET');
    if (!secret) {
      throw new UnauthorizedException(
        'Reset password secret is not configured',
      );
    }

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Validamos que el token sea para reset y no un login robado
      if (payload.purpose !== PWD_RESET_PURPOSE || !payload.email) {
        throw new UnauthorizedException('Token inválido para esta acción');
      }

      // Inyectamos el usuario en la request para el Endpoint 3
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token expirado o corrupto');
    }
  }
}
