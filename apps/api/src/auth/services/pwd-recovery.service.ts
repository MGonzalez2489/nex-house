import { UserSearchService, UserService } from '@administration/user/services';
import { RecoveryCodeResponseDto, ResetPasswordTokenDto } from '@auth/dtos';
import { isProd } from '@core/utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';
import { addMinutes, isPast } from 'date-fns';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

@Injectable()
export class PwdRecoveryService {
  constructor(
    private readonly userSearchService: UserSearchService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  private readonly RECOVERY_CODE_TTL_MINUTES = 30;

  // step 1: validate user by email and create recovery code

  async createRecoveryCode(email: string): Promise<RecoveryCodeResponseDto> {
    const user = await this.userSearchService.findByEmailOrThrow(
      email,
      undefined,
      { neighborhood: true, status: true, role: true },
    );

    if (
      user.role.name !== UserRoleEnum.SUPERADMIN &&
      !user.neighborhood.isActive
    ) {
      throw new ForbiddenException(
        `El usuario pertenece a un fraccionamiento deshabilitado.`,
      );
    }
    if (user.status.name === UserStatusEnum.INACTIVE) {
      throw new ForbiddenException(`El usuario esta deshabilitado`);
    }

    const recoveryCode = this.generateRecoveryCode();
    const expirationDate = addMinutes(
      new Date(),
      this.RECOVERY_CODE_TTL_MINUTES,
    ).toUTCString();
    await this.userService.update(
      user.neighborhoodId,
      user.publicId,
      { recoveryCode, recoveryCodeExpiration: expirationDate },
      user,
    );

    const response: RecoveryCodeResponseDto = {};
    if (!isProd) {
      response.code = recoveryCode;
    }
    return response;
  }

  // step 2: validate code and generate short live (and not refresheable) token
  // exclusive to reset password
  // step 3: validate token, create new password and return new auth token

  async validateCode(code: string): Promise<ResetPasswordTokenDto> {
    const user = await this.userSearchService.findOne({
      recoveryCode: code,
    });

    if (!user) {
      throw new BadRequestException(
        `No se encontro uso para el codigo ${code}.`,
      );
    }

    if (isPast(new Date(user.recoveryCodeExpiration))) {
      throw new BadRequestException(`El codigo de recuperacion ha expirado.`);
    }

    const accessToken = this.tokenService.createResetPasswordToken(
      user.email,
      user.publicId,
    );

    await this.userService.update(
      user.neighborhoodId,
      user.publicId,
      { recoveryToken: accessToken.token },
      user,
    );

    return {
      token: accessToken.token,
      exp: accessToken.expiresInMs,
    };
  }

  async updatePwd(
    email: string,
    newPwd: string,
    userAgent: string,
    ip: string,
    resetToken: string,
  ) {
    const user = await this.userSearchService.findByEmailOrThrow(
      email,
      undefined,
      { status: true },
    );

    if (user.status.name !== UserStatusEnum.PASSWORD_RECOVERY) {
      throw new BadRequestException('Usuario fuera de proceso.');
    }

    const hasRecoveryInfo = !!(
      user.recoveryCode &&
      user.recoveryCodeExpiration &&
      user.recoveryToken
    );

    if (!hasRecoveryInfo) {
      throw new BadRequestException('Usuario fuera de proceso.');
    }

    // Bind the presented token to the one issued in step 2 of this flow, so a
    // leaked/short-lived token cannot be replayed against another user.
    if (user.recoveryToken !== resetToken) {
      throw new UnauthorizedException('Token inválido para esta acción.');
    }

    await this.userService.updatePasswordOnRecoveryProcess(user.id, newPwd);

    return this.sessionService.createSession(user, userAgent, ip);
  }

  generateRecoveryCode(): string {
    // Generate three random uppercase letters (A-Z)
    const generateRandomLetter = (): string => {
      const asciiA = 65; // ASCII code for 'A'
      const alphabetSize = 26;
      return String.fromCharCode(
        asciiA + Math.floor(Math.random() * alphabetSize),
      );
    };

    const prefix = `${generateRandomLetter()}${generateRandomLetter()}${generateRandomLetter()}`;

    // Generate a random 6-digit number
    const min = 100000;
    const max = 999999;
    const recoveryNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Combine the prefix and the number with a hyphen
    return `${prefix}-${recoveryNumber.toString()}`;
  }
}
