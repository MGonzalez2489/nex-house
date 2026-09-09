import { CreateUnitDto } from '@administration/units/dtos';
import { CreateUser } from '@nexhouse/shared-domain/interfaces';
import { Type } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';

export class CreateResidentDto implements CreateUser {
  @IsEmail()
  email: string;

  @IsString()
  userRoleId: string;

  @ValidateNested()
  @Type(() => CreateUnitDto)
  unit: CreateUnitDto;
}
