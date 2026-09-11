import { CreateUnitDto } from '@administration/units/dtos';
import { UpdateUser } from '@nexhouse/shared-domain/interfaces';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateUserDto implements UpdateUser {
  @IsString()
  @IsOptional()
  userRoleId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUnitDto)
  unit?: CreateUnitDto;

  //internal
  @IsString()
  @IsOptional()
  recoveryCode?: string;

  @IsString()
  @IsOptional()
  recoveryCodeExpiration?: string;

  @IsString()
  @IsOptional()
  recoveryToken?: string;
}
