import {
  CodeValidationDto,
  PwdRecoveryRequestDto,
  RecoveryCodeResponseDto,
  ResetPasswordTokenDto,
  ResetPwdDto,
} from '@auth/dtos';
import { ResetPwdGuard, ResetTokenPayload } from '@auth/guards';
import { AuthService, PwdRecoveryService } from '@auth/services';
import { CurrentUser, Public } from '@core/decorators';
import { getClientIp } from '@core/utils';
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionModel } from '@nexhouse/shared-domain/models';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

@ApiTags('Authentication')
@Public()
@Controller('auth')
export class PwdRecoveryController {
  constructor(
    private readonly recoveryService: PwdRecoveryService,
    private readonly authService: AuthService,
  ) {}

  @Post('pwd-recovery-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password recovery code' })
  async pwdRecoveryRequest(
    @Body() dto: PwdRecoveryRequestDto,
  ): Promise<RecoveryCodeResponseDto> {
    return this.recoveryService.createRecoveryCode(dto.email);
  }

  @Post('code-validation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a password recovery code' })
  async codeValidation(
    @Body() dto: CodeValidationDto,
  ): Promise<ResetPasswordTokenDto> {
    return this.recoveryService.validateCode(dto.code);
  }

  // The class-level `@Public()` covers this route for the global JwtAuthGuard;
  // `ResetPwdGuard` is the only gate enforcing the recovery credential here.
  @Post('reset-password')
  @UseGuards(ResetPwdGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password with a reset token' })
  async updatePassword(
    @Body() dto: ResetPwdDto,
    @Req() request: ExpressRequest,
    @CurrentUser() user: ResetTokenPayload,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<SessionModel> {
    const session = await this.recoveryService.updatePwd(
      user.email,
      dto.pwd,
      userAgent,
      getClientIp(request),
      user.token,
    );
    this.authService.createCookie(response, session.refreshToken);

    return session;
  }
}