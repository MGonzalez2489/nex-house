import { ApiProperty } from '@nestjs/swagger';
import { ChangePassword } from '@nexhouse/shared-domain/interfaces';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto implements ChangePassword {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'CurrentSecurePass1!',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description:
      'The new password for the user. Must meet strength requirements.',
    example: 'NewSecurePass2#',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(8, {
  //   message: 'New password must be at least 8 characters long',
  // })
  newPassword: string;
}
