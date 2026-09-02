import { OnboardingStepEnum } from '../enums';

export interface OnboardingStepModel {
  id: OnboardingStepEnum;
  label: string;
  completed: boolean;
  required: boolean;
}
