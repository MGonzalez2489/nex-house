import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Headers as NestHeaders,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionModel } from '@nexhouse/shared-domain/models';
import { LoginDto } from '../dtos';
import { AuthService } from '../services';

import { Public } from '@core/decorators';
import { getClientIp, isProd } from '@core/utils';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: ExpressRequest,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<SessionModel> {
    const session = await this.authService.login(
      loginDto,
      userAgent,
      getClientIp(request),
    );

    this.authService.createCookie(response, session.refreshToken);

    return session;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh session token' })
  async refresh(
    @Req() request: ExpressRequest,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<Omit<SessionModel, 'refreshToken'>> {
    const oldToken = request.cookies?.['refresh_token'];

    if (!oldToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { refreshToken, ...sessionData } =
      await this.authService.refreshAuthentication(
        oldToken,
        userAgent,
        getClientIp(request),
      );

    this.authService.createCookie(response, refreshToken);

    return sessionData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  async logout(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies?.['refresh_token'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Remove the cookie. `secure` must mirror the flag used by AuthService.createCookie
    // (isProd) so strict clients can match and delete the stored cookie on HTTPS.
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}