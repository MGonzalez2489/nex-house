import { CreateUnit } from '@nexhouse/shared-domain/interfaces';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto implements CreateUnit {
  @IsString()
  @IsOptional()
  unitId?: string;

  @IsString()
  @IsOptional()
  streetId?: string;

  @IsString()
  @IsOptional()
  unitTypeId?: string;

  @IsString()
  @IsOptional()
  unitIdentifier?: string;

  @IsString()
  unitRoleId: string;

  //
  @IsString()
  @IsOptional()
  userId?: string;
  @IsBoolean()
  isCurrentOccupant: boolean;
}
