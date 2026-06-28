import { UserSearchService } from '@administration/user/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userSearchService: UserSearchService,
  ) {
    const securityConfig = {
      secret: configService.get<string>('JWT_SECRET') || '',
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfig.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userSearchService.findByEmail(
      payload.email,
      undefined,
      { neighborhood: true },
    );
    if (!user) {
      throw new UnauthorizedException('jwt:User not found');
    }

    return user;
  }
}
