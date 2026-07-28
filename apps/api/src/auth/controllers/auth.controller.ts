import {
  Body,
  Controller,
  Get,
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

import { CurrentUser, Public } from '@core/decorators';
import { UserToModelMapper } from '@core/mappers';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { User } from '@core/database';

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
    const ip =
      request.ip || (request.headers['x-forwarded-for'] as string) || '0.0.0.0';

    const session = await this.authService.login(loginDto, userAgent, ip);

    this.createCookie(response, session.refreshToken);

    return session;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User identity' })
  async me(@CurrentUser() user: User) {
    const response = await this.authService.getFreshProfileUser(user);

    return UserToModelMapper(response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: ExpressRequest,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const oldToken = request.cookies['refresh_token'];

    if (!oldToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { refreshToken, ...sessionData } =
      await this.authService.refreshAuthentication(oldToken, userAgent);

    this.createCookie(response, refreshToken);

    return sessionData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  async logout(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // REMOVE cookie (overriding)
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  private createCookie(response: ExpressResponse, refreshToken: string) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
