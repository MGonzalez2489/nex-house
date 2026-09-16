import { UserSearchService } from '@administration/user/services';
import { User } from '@core/database';
import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  email: string;
  sub?: string;
  session?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userSearchService: UserSearchService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'test-key',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // A token without an email claim is never valid here. Guarding explicitly
    // matters because findByEmail(undefined) would strip the undefined WHERE key
    // and could match an arbitrary (first) user instead of failing.
    if (!payload?.email) {
      this.logger.warn('Access token rejected: missing email claim');
      throw new UnauthorizedException('jwt:Invalid token payload');
    }

    const user = await this.userSearchService.findByEmail(
      payload.email,
      undefined,
      { neighborhood: true, role: true, status: true },
    );

    if (!user) {
      throw new UnauthorizedException('jwt:User not found');
    }

    return user;
  }
}