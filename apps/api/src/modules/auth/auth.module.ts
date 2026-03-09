import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { JwtStrategy } from './strategies';
import { CryptoService } from '@common/services';
import { UsersModule } from '@modules/users';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const securityConfig = {
          secret: configService.get<string>('JWT_SECRET') || '',
          expire: configService.get('JWT_EXPIRRE') || '1h',
        };
        console.log('TOKEN LIFE', securityConfig.expire);

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
  controllers: [AuthController],
  providers: [AuthService, CryptoService, JwtStrategy],
})
export class AuthModule {}
