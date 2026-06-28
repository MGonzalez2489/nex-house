import { Login } from '@nexhouse/shared-domain/interfaces';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto implements Login {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
