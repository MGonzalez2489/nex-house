import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ILogin } from '@nex-house/interfaces';

export class LoginDto implements ILogin {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
