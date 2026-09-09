import { CreateUnitDto } from '@administration/neighborhood/dtos';
import { CreateUser } from '@nexhouse/shared-domain/interfaces';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateResidentDto implements CreateUser {
  @IsEmail()
  email: string;

  @IsString()
  userRoleId: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsOptional()
  unit?: CreateUnitDto;
}
