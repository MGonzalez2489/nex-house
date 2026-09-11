import { Matches, IsNotEmpty, IsString } from 'class-validator';
import { RECOVERY_CODE_PATTERN } from '../pwd-recovery.constants';

export class CodeValidationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(RECOVERY_CODE_PATTERN, {
    message: 'Formato de código de recuperación inválido',
  })
  code: string;
}