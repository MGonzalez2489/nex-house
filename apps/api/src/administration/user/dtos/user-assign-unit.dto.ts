import { UserAssignUnit } from '@nexhouse/shared-domain/interfaces';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UserAssignUnitDto implements UserAssignUnit {
  @IsString()
  userUnitRoleId: string;
  @IsBoolean()
  isOccupant: boolean;

  @IsString()
  @IsOptional()
  unitId?: string;
  @IsString()
  @IsOptional()
  unitIdentifier?: string;
  @IsString()
  @IsOptional()
  streetId?: string;
}
