import { CryptoService } from '@common/services';
import { User } from '@database/entities';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos';
import { UsersService } from '@modules/users';
import { SessionModel } from '@nex-house/models';
import { UserEntityToModel } from '@modules/users/mappers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private userService: UsersService,
  ) {}

  async register(dto: LoginDto): Promise<SessionModel | undefined> {
    try {
      const existingUser = await this.userService.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await this.cryptoService.hash(dto.password);

      // TODO: fix this
      // const newUser = await this.userService.create(dto.email, hashedPassword);

      // this.logger.log(`User registered successfully: ${newUser.email}`);
      //
      // return this.createSession(newUser);
      return;
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      console.log('error', error);

      this.logger.error(`Error registering user: ${error.message}`);
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async login(dto: LoginDto): Promise<SessionModel> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
