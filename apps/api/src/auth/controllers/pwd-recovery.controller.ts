import { RecoveryCodeResponseDto, ResetPasswordTokenDto } from '@auth/dtos';
import { ResetPwdGuard } from '@auth/guards';
import { AuthService, PwdRecoveryService } from '@auth/services';
import { User } from '@core/database';
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
    @Body() dto: { email: string },
  ): Promise<RecoveryCodeResponseDto> {
    return this.recoveryService.createRecoveryCode(dto.email);
  }

  @Public()
  @Post('code-validation')
  @HttpCode(HttpStatus.OK)
  async codeValidation(
    @Body() dto: { code: string },
  ): Promise<ResetPasswordTokenDto> {
    return this.recoveryService.validateCode(dto.code);
  }

  @Post('reset-password')
  @UseGuards(ResetPwdGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() dto: { pwd: string },
    @Req() request: ExpressRequest,
    @CurrentUser() user: User,
    @NestHeaders('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<SessionModel> {
    const ip =
      request.ip || (request.headers['x-forwarded-for'] as string) || '0.0.0.0';

    const session = await this.recoveryService.updatePwd(
      user.email,
      dto.pwd,
      userAgent,
      ip,
    );
    this.authService.createCookie(response, session.refreshToken);

    return session;
  }
}
