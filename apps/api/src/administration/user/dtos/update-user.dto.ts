import { UpdateUser } from '@nexhouse/shared-domain/interfaces';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto implements UpdateUser {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // @IsString()
  // @IsOptional()
  // userRoleId?: string;
  //
  // @IsString()
  // @IsOptional()
  // unitId?: string;

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
  //roles
  @IsString()
  @IsOptional()
  userRoleId?: string;
  @IsString()
  @IsOptional()
  unitRoleId?: string;
  @IsString()
  @IsOptional()
  isCurrentOccupant?: boolean;
}
