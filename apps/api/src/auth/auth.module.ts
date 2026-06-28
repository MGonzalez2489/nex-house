import { UserModule } from '@administration/user/user.module';
import { NxSession } from '@core/database';
import { CryptoService } from '@core/services';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([NxSession]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const securityConfig = {
          secret: configService.get<string>('JWT_SECRET') || '',
          expire: configService.get('JWT_EXPIRRE') || '1h',
        };

        return {
          global: true,
          secret: securityConfig.secret,
          signOptions: {
            expiresIn: securityConfig.expire,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, SessionService, CryptoService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
