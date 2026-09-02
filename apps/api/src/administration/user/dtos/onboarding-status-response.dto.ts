import { OnboardingStepEnum } from '@nexhouse/shared-domain/enums';
import {
  OnboardingStatusResponseModel,
  OnboardingStepModel,
} from '@nexhouse/shared-domain/models';
import { IsBoolean } from 'class-validator';

export class OnboardingStatusResponseDto implements OnboardingStatusResponseModel {
  @IsBoolean()
  isCompleted: boolean;
  currentStepId: OnboardingStepEnum;
  steps: OnboardingStepModel[];
}
