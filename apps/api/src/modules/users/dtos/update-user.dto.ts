import { UserRoleEnum } from '@nex-house/enums';
import { IUpdateUser } from '@nex-house/interfaces';
import { IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto implements IUpdateUser {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: UserRoleEnum;

  @IsBoolean()
  isAdmin: boolean;
}
