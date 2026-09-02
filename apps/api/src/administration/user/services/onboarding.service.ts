import { User, UserStatus } from '@core/database';
import { Injectable } from '@nestjs/common';
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

  async getOnboardingStatus(
    userId: string,
  ): Promise<OnboardingStatusResponseDto> {
    const user = await this.userRepository.findOne({
      where: { publicId: userId },
      relations: { role: true, status: true, userUnits: true, profile: true }, //['role', 'status', 'userUnits'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 1. Evaluar si debe crear unidad (Solo Admin inicial sin unidades)
    const isAdmin = user.isFirstAdmin; // O según el código/id de tu catálogo de roles
    const hasUnits = user.userUnits && user.userUnits.length > 0;
    const requiresUnitCreation = isAdmin && !hasUnits;

    // 2. Evaluar cuáles pasos fueron completados
    const isSecurityCompleted = !user.requirePwdChange;
    const isProfileCompleted = Boolean(
      user.profile.firstName && user.profile.lastName && user.profile.phone,
    );
    const isUnitCompleted = !requiresUnitCreation || hasUnits;

    // 3. Construir lista dinámica de pasos
    const steps: OnboardingStepDto[] = [
      {
        id: OnboardingStepEnum.WELCOME,
        label: 'Bienvenida',
        completed: isSecurityCompleted, // Paso informativo
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

    // Condicional para insertar el paso solo si aplica al usuario
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

    // 4. Determinar el paso actual
    const currentStep =
      steps.find((s) => !s.completed) || steps[steps.length - 1];
    const isCompleted =
      user.status?.name === UserStatusEnum.ACTIVE ||
      (!requiresUnitCreation && isSecurityCompleted && isProfileCompleted);

    return {
      isCompleted,
      currentStepId: currentStep.id,
      steps,
    };
  }

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
