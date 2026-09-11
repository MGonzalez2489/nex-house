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

  /**
   * Creates the access token used to reach private API endpoints.
   *
   * @param email The user's email, embedded as the `email` claim.
   * @param userPublicId The user's public ID, embedded as the `sub` claim.
   * @param sessionPublicId The active session's public ID, embedded as the
   *   `session` claim.
   * @returns A `NexHouseToken` of type `'access'` with the signed JWT, the
   *   expiration timestamp (in ms) and the matching UTC date string.
   */
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
    const expiresAt = this.getDateWithMS(ACCESS_TOKEN_DURATION);

    return {
      type: 'access',
      token,
      expiresInMs: expiresAt,
      expiresAtDate: this.getDateStrFromMs(expiresAt),
    };
  }

  /**
   * Creates the refresh token used to re-issue an access token.
   *
   * @param userPublicId The user's public ID, embedded as the `sub` claim.
   * @param sessionPublicId The active session's public ID, embedded as the
   *   `session` claim.
   * @param rememberMe Extends the token lifetime from 7 days to 30 days when
   *   `true`.
   * @returns A `NexHouseToken` of type `'refresh'` with the signed JWT, the
   *   expiration timestamp (in ms) and the matching UTC date string.
   */
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
    const expiresAt = this.getDateWithMS(end);

    return {
      type: 'refresh',
      token,
      expiresInMs: expiresAt,
      expiresAtDate: this.getDateStrFromMs(expiresAt),
    };
  }

  /**
   * Creates the reset token used in the password recovery flow. It is only
   * valid for the 'api/auth/code-validation' endpoint and is signed with the
   * dedicated `JWT_RESET` secret.
   *
   * @param email The user's email, embedded as the `email` claim.
   * @param userPublicId The user's public ID, embedded as the `sub` claim.
   * @returns A `NexHouseToken` of type `'reset_password'` with the signed JWT,
   *   the expiration timestamp (in ms) and the matching UTC date string.
   */
  createResetPasswordToken(
    email: string,
    userPublicId: string,
  ): NexHouseToken {
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
    const expiresAt = this.getDateWithMS(RESET_TOKEN_EXPIRATION);

    return {
      token,
      type: 'reset_password',
      expiresInMs: expiresAt,
      expiresAtDate: this.getDateStrFromMs(expiresAt),
    };
  }

  /**
   * Validates the integrity and expiry of a JWT and returns its decoded payload.
   *
   * @param token The raw JWT string to verify against the JWT secret.
   * @returns The decoded token payload when the token is valid; otherwise the
   *   underlying `JwtService` error is propagated.
   */
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  /**
   * Computes the future epoch timestamp of `now + msToAdd`.
   *
   * @param msToAdd The milliseconds to add to the current time.
   * @returns The resulting epoch timestamp in milliseconds.
   */
  private getDateWithMS(msToAdd: number): number {
    const date = new Date();
    const currentMs = date.getTime();

    // Add the milliseconds
    const finalMs = currentMs + msToAdd;

    return finalMs;
  }

  /**
   * Converts an epoch timestamp (in ms) into a UTC date string.
   *
   * @param ms The epoch timestamp in milliseconds to format.
   * @returns A UTC date string (e.g. `Tue, 11 Sep 2026 19:00:00 GMT`).
   */
  private getDateStrFromMs(ms: number) {
    const date: Date = new Date(ms);
    return date.toUTCString();
  }
}