import { UserRoleEnum } from '@nex-house/enums';
import { ICreateUser } from '@nex-house/interfaces';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto implements ICreateUser {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  role: UserRoleEnum;
}
