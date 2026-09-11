import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PwdRecoveryRequestDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}