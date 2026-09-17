import { User, UserStatus } from '@core/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnboardingStepEnum,
  UserStatusEnum,
} from '@nexhouse/shared-domain/enums';
import { Repository } from 'typeorm';
import { OnboardingStatusResponseDto, OnboardingStepDto } from '../dtos';
import { CatalogsService } from '@catalogs/services';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly catalogsService: CatalogsService,
  ) {}

  /**
   * Computes the onboarding progress for a user, including which steps are
   * required and which one is pending.
   *
   * @param publicId Public unique identifier of the user.
   * @returns The current onboarding status and its step list.
   *
   * @throws {NotFoundException} If the user does not exist.
   */
  async getOnboardingStatus(
    publicId: string,
  ): Promise<OnboardingStatusResponseDto> {
    const user = await this.userRepository.findOne({
      where: { publicId },
      relations: { role: true, status: true, userUnits: true, profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with public ID '${publicId}' not found`);
    }

    // Only the initial admin is expected to create their own unit.
    const requiresUnitCreation = user.isFirstAdmin;
    const hasUnits = (user.userUnits?.length ?? 0) > 0;

    const isSecurityCompleted = !user.requirePwdChange;
    const isProfileCompleted = Boolean(
      user.profile?.firstName && user.profile?.lastName && user.profile?.phone,
    );
    const isUnitCompleted = !requiresUnitCreation || hasUnits;
    const isCompleted =
      user.status?.name === UserStatusEnum.ACTIVE ||
      (!requiresUnitCreation && isSecurityCompleted && isProfileCompleted);

    const steps: OnboardingStepDto[] = [
      {
        id: OnboardingStepEnum.WELCOME,
        label: 'Bienvenida',
        completed: isSecurityCompleted,
        required: true,
      },
      {
        id: OnboardingStepEnum.SECURITY,
        label: 'Seguridad',
        completed: isSecurityCompleted,
        required: true,
      },
      {
        id: OnboardingStepEnum.GENERAL_FORM,
        label: 'Información General',
        completed: isProfileCompleted,
        required: true,
      },
    ];

    // The unit creation step only applies to the initial admin.
    if (requiresUnitCreation) {
      steps.push({
        id: OnboardingStepEnum.CREATE_UNIT,
        label: 'Crear Unidad',
        completed: hasUnits,
        required: true,
      });
    }

    steps.push({
      id: OnboardingStepEnum.COMPLETE,
      label: 'Finalizar',
      completed: isSecurityCompleted && isProfileCompleted && isUnitCompleted,
      required: true,
    });

    const currentStep =
      steps.find((step) => !step.completed) ?? steps[steps.length - 1];

    return {
      isCompleted,
      currentStepId: currentStep.id,
      steps,
    };
  }

  /**
   * Marks the onboarding as completed by activating the user status.
   *
   * @param userId Internal id of the user finishing onboarding.
   */
  async completeOnboarding(userId: number): Promise<void> {
    const activeStatus = await this.catalogsService.findByName(
      UserStatus,
      UserStatusEnum.ACTIVE,
    );

    await this.userRepository.update(userId, {
      statusId: activeStatus.id,
    });
  }
}
