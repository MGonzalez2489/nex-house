import { UserSearchService, UserService } from '@administration/user/services';
import { RecoveryCodeResponseDto, ResetPasswordTokenDto } from '@auth/dtos';
import { CryptoService } from '@core/services';
import { isProd } from '@core/utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRoleEnum, UserStatusEnum } from '@nexhouse/shared-domain/enums';
import { addMinutes, isPast } from 'date-fns';
import { SessionService } from './session.service';

//TODO: transalte errors to english

@Injectable()
export class PwdRecoveryService {
  private readonly logger = new Logger(PwdRecoveryService.name);

  constructor(
    private readonly userSearchService: UserSearchService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  // step 1: validate user by email and create recovery code

  async createRecoveryCode(email: string) {
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
    const minutesToAdd = 30;
    const expirationDate = addMinutes(new Date(), minutesToAdd).toUTCString();
    // encrypt code
    await this.userService.update(
      user.neighborhoodId,
      user.publicId,
      { recoveryCode, recoveryCodeExpiration: expirationDate },
      user,
    );

    //TODO: send code by email
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

    const expiredCode = isPast(new Date(user.recoveryCodeExpiration));
    if (expiredCode) {
      throw new BadRequestException(`El codigo de recuperacion ha espierado.`);
    }

    //token used just to change password
    const securityConfig = {
      reset: this.configService.get<string>('JWT_RESET') || '',
    };

    const expirationTime = 5; //5mn
    const accessToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.publicId,
        purpose: 'password_reset',
      },
      {
        expiresIn: `${expirationTime}m`,
        secret: securityConfig.reset,
      },
    );

    await this.userService.update(
      user.neighborhoodId,
      user.publicId,
      { recoveryToken: accessToken },
      user,
    );

    return {
      token: accessToken,
      exp: this.calculateExpirationInSeconds(expirationTime),
    };
  }

  async updatePwd(
    email: string,
    newPwd: string,
    userAgent: string,
    ip: string,
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

    await this.userService.updatePasswordOnRecoveryProcess(user.id, newPwd);

    return this.sessionService.createSession(user, userAgent, ip);
  }

  private generateRecoveryCode(): string {
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

  /**
   * Calculates a Unix timestamp (in seconds) representing a future expiration time.
   * The expiration time is 'minutesToAdd' from the current moment.
   *
   * @param minutesToAdd The number of minutes from now when the token/session should expire.
   * @returns A Unix timestamp (number of seconds since Jan 1, 1970 UTC) representing the expiration.
   */
  private calculateExpirationInSeconds(minutesToAdd: number): number {
    const nowInMs = Date.now(); // Obtiene la hora actual en milisegundos

    if (!minutesToAdd) {
      minutesToAdd = 15;
    }

    // Calcula la duración en milisegundos
    const durationInMs = minutesToAdd * 60 * 1000; // minutos * segundos/minuto * milisegundos/segundo

    // Suma la duración a la hora actual para obtener el tiempo futuro en milisegundos
    const futureTimeInMs = nowInMs + durationInMs;

    // Convierte el tiempo futuro de milisegundos a segundos y redondea hacia abajo
    const expirationInSeconds = Math.floor(futureTimeInMs / 1000);

    return expirationInSeconds;
  }
}
