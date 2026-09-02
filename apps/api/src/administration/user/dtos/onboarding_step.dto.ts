import { OnboardingStepEnum } from '@nexhouse/shared-domain/enums';
import { OnboardingStepModel } from '@nexhouse/shared-domain/models';
import { IsBoolean, IsString } from 'class-validator';

export class OnboardingStepDto implements OnboardingStepModel {
  id: OnboardingStepEnum;
  @IsString()
  label: string;
  @IsBoolean()
  completed: boolean;
  @IsBoolean()
  required: boolean;
}
