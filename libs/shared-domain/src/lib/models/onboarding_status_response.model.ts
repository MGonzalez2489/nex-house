import { OnboardingStepEnum } from '../enums';
import { OnboardingStepModel } from './onboarding_step.model';

export interface OnboardingStatusResponseModel {
  isCompleted: boolean;
  currentStepId: OnboardingStepEnum;
  steps: OnboardingStepModel[];
}
