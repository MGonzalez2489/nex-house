import { UpdateUserProfile } from '@nexhouse/shared-domain/interfaces';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserProfileDto implements UpdateUserProfile {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
