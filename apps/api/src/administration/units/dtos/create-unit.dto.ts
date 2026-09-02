import { CreateUnit } from '@nexhouse/shared-domain/interfaces';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto implements CreateUnit {
  @IsString()
  streetId: string;
  @IsString()
  unitTypeId: string;
  @IsString()
  unitIdentifier: string;
  @IsString()
  unitRoleId: string;

  //
  @IsString()
  @IsOptional()
  userId?: string;
  @IsBoolean()
  isCurrentOccupant: boolean;
}
