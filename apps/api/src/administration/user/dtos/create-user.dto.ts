import { CreateUser } from '@nexhouse/shared-domain/interfaces';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserAssignUnitDto } from './user-assign-unit.dto';

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
