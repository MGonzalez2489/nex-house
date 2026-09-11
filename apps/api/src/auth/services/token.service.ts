import {
  ACCESS_TOKEN_DURATION,
  PWD_RESET_PURPOSE,
  REFRESH_TOKEN_DURATION,
  REFRESH_TOKEN_REMEMBER_DURATION,
  RESET_TOKEN_EXPIRATION,
} from '@auth/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { intervalToDuration } from 'date-fns';

export type NexHouseToken = {
  type: string;
  token: string;
  expiresAtDate: string;
  expiresInMs: number;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //Crea el access token usado para acceder a endpoints privados del api
  createAccessToken(
    email: string,
    userPublicId: string,
    sessionPublicId: string,
  ): NexHouseToken {
    const duration = intervalToDuration({
      start: 0,
      end: ACCESS_TOKEN_DURATION,
    });
    const token = this.jwtService.sign(
      {
        email,
        sub: userPublicId,
        session: sessionPublicId,
      },
      {
        expiresIn: `${duration.minutes}m`,
      },
    );

    return {
      type: 'access',
      token,
      expiresInMs: this.getDateWithMS(ACCESS_TOKEN_DURATION),
      expiresAtDate: this.getDateStrFromMs(ACCESS_TOKEN_DURATION),
    };
  }

  //crea el refresh token usado para re crear un access token
  createRefreshAccessToken(
    userPublicId: string,
    sessionPublicId: string,
    rememberMe: boolean,
  ): NexHouseToken {
    const end = rememberMe
      ? REFRESH_TOKEN_REMEMBER_DURATION
      : REFRESH_TOKEN_DURATION;
    const duration = intervalToDuration({
      start: 0,
      end,
    });

    const token = this.jwtService.sign(
      {
        sub: userPublicId,
        session: sessionPublicId,
      },
      {
        expiresIn: `${duration.days}d`,
      },
    );

    return {
      type: 'refresh',
      token,

      expiresInMs: this.getDateWithMS(end),
      expiresAtDate: this.getDateStrFromMs(end),
    };
  }

  // crea el reset token usado en el proceso de recuperacion de contraseña
  // este token solamente es valido para el endpoint 'api/auth/code-validation'
  createResetPasswordToken(email: string, userPublicId: string): NexHouseToken {
    const resetSecret = this.configService.get<string>('JWT_RESET') || '';

    const duration = intervalToDuration({
      start: 0,
      end: RESET_TOKEN_EXPIRATION,
    });

    const payload = {
      email,
      sub: userPublicId,
      purpose: PWD_RESET_PURPOSE,
    };
    const token = this.jwtService.sign(payload, {
      secret: resetSecret,
      expiresIn: `${duration.minutes}m`,
    });

    return {
      token,
      type: 'reset_password',
      expiresInMs: this.getDateWithMS(RESET_TOKEN_EXPIRATION),
      expiresAtDate: this.getDateStrFromMs(RESET_TOKEN_EXPIRATION),
    };
  }

  // valida si un token es valido o no
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  //Calcula la fecha futura de este momento + ms adicionales
  //retorna ms
  private getDateWithMS(msToAdd: number): number {
    const date = new Date();
    const currentMs = date.getTime();

    // Add the milliseconds
    const finalMs = currentMs + msToAdd;

    return finalMs;
  }

  //calcula la fecha futura desde este momento + ms adicionales
  //retorna UTC date string
  private getDateStrFromMs(ms: number) {
    const date: Date = new Date(ms);
    return date.toUTCString();
  }
}
