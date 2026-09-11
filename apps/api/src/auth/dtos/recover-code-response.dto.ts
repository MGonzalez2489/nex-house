import { RecoveryCodeResponse } from '@nexhouse/shared-domain/interfaces';
import { IsOptional, IsString } from 'class-validator';

export class RecoveryCodeResponseDto implements RecoveryCodeResponse {
  @IsOptional()
  @IsString()
  code?: string;
}
