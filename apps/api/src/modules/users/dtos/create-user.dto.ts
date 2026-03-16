import { ICreateUser } from '@nex-house/interfaces';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto implements ICreateUser {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsBoolean()
  isAdmin: boolean;

  @IsString()
  @IsOptional()
  unitId?: string;
  @IsString()
  @IsOptional()
  streetName?: string;
  @IsString()
  @IsOptional()
  identifier?: string;
}
