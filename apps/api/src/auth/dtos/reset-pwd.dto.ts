import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPwdDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  pwd: string;
}