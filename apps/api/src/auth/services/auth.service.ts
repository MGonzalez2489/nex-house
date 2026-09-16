import {
  OnboardingService,
  UserSearchService,
  UserService,
} from '@administration/user/services';
import { REFRESH_TOKEN_DURATION } from '@auth/constants';
import { User } from '@core/database';
import { CryptoService } from '@core/services';
import { isProd } from '@core/utils';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OnboardingStepEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nexhouse/shared-domain/enums';
import { SessionModel } from '@nexhouse/shared-domain/models';
import { Response as ExpressResponse } from 'express';
import { LoginDto } from '../dtos';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userSearchService: UserSearchService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly cryptoService: CryptoService,
    private readonly onboardingService: OnboardingService,
  ) {}

  /**
   * Authenticates user identity credentials, enforces granular multi-tenant domain state rules,
   * and dispatches authorization token lifecycles via dedicated Session services.
   *
   * @param dto Data transfer object containing the user's login credentials.
   * @param userAgent Raw string header metadata describing the client device structure.
   * @param ip The origin IP network execution address.
   * @throws UnauthorizedException if email presence validation or hashing criteria fail matching rules.
   * @throws ForbiddenException if domain boundaries, status definitions, or neighborhood gates are closed.
   * @returns A promise resolving to the final active Session model.
   */
  async login(
    dto: LoginDto,
    userAgent: string,
    ip: string,
  ): Promise<SessionModel> {
    let user: User | null = await this.findLoginUser(dto.email);

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

    // Neighborhood membership gates only apply to non-root users;
    // root users are not bound to a single tenant boundary.
    if (user.role.name !== UserRoleEnum.SUPERADMIN) {
      if (!user.neighborhood) {
        throw new ForbiddenException('Invalid neighborhood assignation.');
      }

      if (!user.neighborhood.isActive) {
        throw new ForbiddenException('Neighborhood not available.');
      }
    }

    // Status gates apply to every role. This check deliberately lives outside
    // the neighborhood block above, so an INACTIVE SUPERADMIN cannot bypass it.
    if (user.status.name === UserStatusEnum.INACTIVE) {
      throw new ForbiddenException(
        'Authentication disabled. Contact your administrator.',
      );
    }

    //if onboarding is pending to complete and there's missing the last step `complete`
    //lets finish it here
    if (user.status.name === UserStatusEnum.PENDING_ONBOARDING) {
      // autocomplete onboarding if last step missing
      const onboardingState = await this.onboardingService.getOnboardingStatus(
        user.publicId,
      );

      if (
        !onboardingState.isCompleted &&
        onboardingState.currentStepId === OnboardingStepEnum.COMPLETE
      ) {
        await this.onboardingService.completeOnboarding(user.id);
        user = await this.findLoginUser(dto.email);
      }
    }

    //if there's a password recovery state but login was success
    //lets clean up the state (meaning user was able to login)
    if (user.status.name === UserStatusEnum.PASSWORD_RECOVERY) {
      await this.userService.cleanPwdRecoveryState(user.id);
    }

    this.logger.log(`User '${user.email}' logged in successfully.`);

    return this.sessionService.createSession(user, userAgent, ip);
  }

  createCookie(
    response: ExpressResponse,
    refreshToken: string,
    maxAge = REFRESH_TOKEN_DURATION,
  ) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge,
    });
  }

  async refreshAuthentication(
    token: string,
    userAgent: string,
    ip?: string,
  ): Promise<SessionModel> {
    return this.sessionService.refreshSession(token, userAgent, ip);
  }

  async logout(refreshToken: string): Promise<void> {
    return this.sessionService.logout(refreshToken);
  }

  private findLoginUser(email: string): Promise<User | null> {
    return this.userSearchService.findByEmail(email, undefined, {
      neighborhood: true,
      role: true,
      status: true,
    });
  }
}
