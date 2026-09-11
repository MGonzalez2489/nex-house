import {
  CodeValidationDto,
  PwdRecoveryRequestDto,
  RecoveryCodeResponseDto,
  ResetPasswordTokenDto,
  ResetPwdDto,
} from '@auth/dtos';
import { ResetPwdGuard } from '@auth/guards';
import { AuthService, PwdRecoveryService } from '@auth/services';
import { CurrentUser, Public } from '@core/decorators';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Headers as NestHeaders,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionModel } from '@nexhouse/shared-domain/models';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

type ResetTokenPayload = {
  email: string;
  sub: string;
  purpose: string;
};

@ApiTags('Authentication')
@Controller('auth')
export class PwdRecoveryController {
  constructor(
    private readonly recoveryService: PwdRecoveryService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('pwd-recovery-request')
  @HttpCode(HttpStatus.OK)
  async pwdRecoveryRequest(
    @Body() dto: PwdRecoveryRequestDto,
  ): Promise<RecoveryCodeResponseDto> {
    return this.recoveryService.createRecoveryCode(dto.email);
  }

  @Public()
  @Post('code-validation')
  @HttpCode(HttpStatus.OK)
  async codeValidation(
    @Body() dto: CodeValidationDto,
  ): Promise<ResetPasswordTokenDto> {
    return this.recoveryService.validateCode(dto.code);
  }

  @Post('reset-password')
  @UseGuards(ResetPwdGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() dto: ResetPwdDto,
    @Req() request: ExpressRequest,
    @CurrentUser() user: ResetTokenPayload,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<SessionModel> {
    const ip =
      request.ip || (request.headers['x-forwarded-for'] as string) || '0.0.0.0';
    const token = request.headers.authorization?.split(' ')[1] ?? '';

    const session = await this.recoveryService.updatePwd(
      user.email,
      dto.pwd,
      userAgent,
      ip,
      token,
    );
    this.authService.createCookie(response, session.refreshToken);

    return session;
  }
}
