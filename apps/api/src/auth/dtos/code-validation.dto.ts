import { RECOVERY_CODE_PATTERN } from '@auth/constants';
import { Matches, IsNotEmpty, IsString } from 'class-validator';

export class CodeValidationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(RECOVERY_CODE_PATTERN, {
    message: 'Formato de código de recuperación inválido',
  })
  code: string;
}
