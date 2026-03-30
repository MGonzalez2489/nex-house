import { CryptoService } from '@common/services';
import { User } from '@database/entities';
import { UsersService } from '@modules/users';
import { UserEntityToModel } from '@modules/users/mappers';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionModel } from '@nex-house/models';
import { LoginDto } from '../dtos';
import {
  NeighborhoodStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nex-house/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private userService: UsersService,
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
    return this.createSession(user);
  }

  async me(current: User) {
    return UserEntityToModel(current);
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
