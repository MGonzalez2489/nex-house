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

    return session;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User identity' })
  async me(@CurrentUser() user: User) {
    const response = await this.authService.getFreshProfileUser(user);

    return UserToModelMapper(response);
  }
}
