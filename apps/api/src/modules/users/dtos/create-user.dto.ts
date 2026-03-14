import { UserRoleEnum } from '@nex-house/enums';
import { ICreateUser } from '@nex-house/interfaces';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class CreateUserDto implements ICreateUser {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsBoolean()
  isAdmin: boolean;
  @IsString()
  phone: UserRoleEnum;
}
