import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    const securityConfig = {
      secret: this.configService.get<string>('JWT_RESET') || '',
    };

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: securityConfig.secret,
      });

      // Validamos que el token sea para reset y no un login robado
      if (payload.purpose !== 'password_reset') {
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
