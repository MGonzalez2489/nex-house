import { CurrentUser, Public } from '@common/decorators';
import { User } from '@database/entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionModel, UserModel } from '@nex-house/models';
import { LoginDto } from './dtos';
import { ResetTokenGuard } from './guards';
import { AuthService } from './services';
import { Request as ExpressRequest } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto): Promise<SessionModel> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User' })
  async me(@CurrentUser() user: User): Promise<UserModel> {
    return this.authService.me(user);
  }

  @Public()
  @Post('password-recovery')
  @HttpCode(HttpStatus.OK)
  async passwordRecovery(@Body() dto: { email: string }): Promise<string> {
    return this.authService.createPwdRecoveryCode(dto.email);
  }

  @Public()
  @Post('recovery-validate')
  @HttpCode(HttpStatus.OK)
  async recoveryValidate(@Body() dto: { code: string }): Promise<string> {
    return this.authService.validatePwdRecoveryCode(dto.code);
  }

  @Public()
  @UseGuards(ResetTokenGuard)
  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async passwordReset(
    @Body() dto: { password: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
  ): Promise<SessionModel> {
    const userId = req.user.sub;

    return this.authService.passwordReset(userId, dto.password);
  }
}
