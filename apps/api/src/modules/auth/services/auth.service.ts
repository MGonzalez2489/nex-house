import { CryptoService } from '@common/services';
import { User } from '@database/entities';
import { UsersService } from '@modules/users';
import { UserEntityToModel } from '@modules/users/mappers';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  NeighborhoodStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nex-house/enums';
import { SessionModel } from '@nex-house/models';
import { LoginDto } from '../dtos';
import { isProd, isStringOnlyDigits } from '@common/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<SessionModel> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //non root user validations
    if (user.role !== UserRoleEnum.SUPER_ADMIN) {
      if (!user.neighborhood) {
        throw new ForbiddenException('Invalid neighborhood assignation.');
      }

      if (user.neighborhood.status !== NeighborhoodStatusEnum.ACTIVE) {
        throw new ForbiddenException('Neighborhood not available.');
      }

      if (user.status === UserStatusEnum.INACTIVE) {
        throw new ForbiddenException(
          'Authentication disabled. Contact your administrator.',
        );
      }
    }

    const isMatch = await this.cryptoService.compare(
      dto.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.pwdResetCode) {
      await this.userService.update_internal(user.id, {
        pwdResetCode: null,
        pwdResetToken: null,
      });
    }

    return this.createSession(user);
  }

  async me(current: User) {
    return UserEntityToModel(current);
  }

  //generate 8 digits code to recover password
  async createPwdRecoveryCode(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return '';
    }

    const min = 10000000; // Smallest 8-digit number
    const max = 99999999; // Largest 8-digit number
    const recoveryCode = Math.floor(Math.random() * (max - min + 1)) + min;

    this.userService.update_internal(user.id, { pwdResetCode: recoveryCode });

    //TODO: send code by email

    if (isProd) return '';

    return recoveryCode.toString();
  }

  async validatePwdRecoveryCode(code: string) {
    if (code.length !== 8) {
      throw new BadRequestException('Invalid code format');
    }

    if (!isStringOnlyDigits(code)) {
      throw new BadRequestException('Invalid code format');
    }

    const user = await this.userService.findByResetPasswordCode(Number(code));

    if (!user) {
      throw new NotFoundException('Code target not found.');
    }

    const securityConfig = {
      reset: this.configService.get<string>('JWT_RESET') || '',
    };

    try {
      if (user.pwdResetToken) {
        await this.jwtService.verifyAsync(user.pwdResetToken, {
          secret: securityConfig.reset,
        });
        return user.pwdResetToken;
      }
    } catch {
      this.logger.log(
        `Invalid existing token for user ${user.id}. Let's create a new one`,
      );
    }

    //generateResetToken
    const payload = {
      sub: user.publicId,
      purpose: 'password_reset',
    };

    const token = this.jwtService.sign(payload, {
      secret: securityConfig.reset,
      expiresIn: '10m',
    });

    await this.userService.update_internal(user.id, {
      pwdResetToken: token,
    });

    return token;
  }

  async passwordReset(userPublicId: string, newPassword: string) {
    const user = await this.userService.findByPublicId(userPublicId);
    if (!user) {
      throw new NotFoundException('Target not found');
    }

    const hashedPassword = await this.cryptoService.hash(newPassword);

    await this.userService.update_internal(user.id, {
      password: hashedPassword,
      pwdResetCode: null,
      pwdResetToken: null,
    });

    //TODO: send confirmation email

    return this.createSession(user);
  }

  /// PRIVATE
  private createSession(user: User): SessionModel {
    const payload = {
      email: user.email,
      sub: user.publicId,
    };

    const newToken = this.jwtService.sign(payload);

    const decoded = this.jwtService.decode(newToken);

    const newSession: SessionModel = {
      token: newToken,
      exp: decoded.exp,
      user: UserEntityToModel(user),
    };

    return newSession;
  }
}
