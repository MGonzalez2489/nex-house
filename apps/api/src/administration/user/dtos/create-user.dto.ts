import { CreateUser } from '@nexhouse/shared-domain/interfaces';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto implements CreateUser {
  @IsEmail()
  email: string;

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
  @IsOptional()
  userRoleId: string;
  @IsString()
  @IsOptional()
  unitRoleId: string;

  @IsBoolean()
  @IsOptional()
  isCurrentOccupant: boolean;
}
