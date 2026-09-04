import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos';
import {
  OnboardingService,
  UserSearchService,
} from '@administration/user/services';
import {
  OnboardingStepEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@nexhouse/shared-domain/enums';
import { CryptoService } from '@core/services';
import { SessionService } from './session.service';
import { User } from '@core/database';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userSearchService: UserSearchService,
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
  async login(dto: LoginDto, userAgent: string, ip: string) {
    let user = await this.userSearchService.findByEmail(dto.email, undefined, {
      neighborhood: true,
      role: true,
      status: true,
    });

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

    if (user.role.name !== UserRoleEnum.SUPERADMIN) {
      if (!user.neighborhood) {
        throw new ForbiddenException('Invalid neighborhood assignation.');
      }

      if (!user.neighborhood.isActive) {
        throw new ForbiddenException('Neighborhood not available.');
      }

      if (user.status.name === UserStatusEnum.INACTIVE) {
        throw new ForbiddenException(
          'Authentication disabled. Contact your administrator.',
        );
      }
    }

    // autocomplete onboarding if last step missing
    const onboardingState = await this.onboardingService.getOnboardingStatus(
      user.publicId,
    );
    if (
      !onboardingState.isCompleted &&
      onboardingState.currentStepId === OnboardingStepEnum.COMPLETE
    ) {
      await this.onboardingService.completeOnboarding(user.id);
      user = await this.userSearchService.findByEmail(dto.email, undefined, {
        neighborhood: true,
        role: true,
        status: true,
      });
    }

    return this.sessionService.createSession(user, userAgent, ip);
  }

  async refreshAuthentication(token: string, userAgent: string) {
    return this.sessionService.refreshSession(token, userAgent);
  }

  async logout(refreshToken: string) {
    return this.sessionService.logout(refreshToken);
  }

  async getFreshProfileUser(user: User) {
    if (user.role.name === UserRoleEnum.SUPERADMIN) return user;

    return this.userSearchService.findByPublicId(
      user.publicId,
      user.neighborhoodId,
      {
        neighborhood: true,
        role: true,
        status: true,
      },
    );
  }
}
