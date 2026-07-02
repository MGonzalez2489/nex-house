import { CreateUser, UserAssignUnit } from '@nexhouse/shared-domain/interfaces';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

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

export class CreateUserDto implements CreateUser {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  roleId: string;

  assignUnits: UserAssignUnitDto;
}
