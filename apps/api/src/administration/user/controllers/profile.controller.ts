import { User } from '@core/database';
import { CurrentUser, Public } from '@core/decorators';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChangePasswordDto, UpdateUserDto } from '../dtos';
import { UserService } from '../services';

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get a user profile' })
  async get(@CurrentUser() user: User) {
    return user;
  }

  @Patch()
  @ApiOperation({ summary: 'Update a user' })
  async create(@Body() dto: UpdateUserDto, @CurrentUser() user: User) {
    const response = await this.usersService.update(
      user.neighborhoodId,
      user.publicId,
      dto,
      user,
    );
    if (!response) {
      throw new InternalServerErrorException('Used not created.');
    }
    return response;
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK) // Return 204 No Content on successful password change
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 204, description: 'Password successfully changed.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid password details provided.',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const passwordChanged: boolean = await this.usersService.changePassword(
      user.publicId,
      dto.oldPassword,
      dto.newPassword,
    );

    if (!passwordChanged) {
      // The UserService.changePassword method returns false if the old password doesn't match,
      // the new password is the same as the old, or the new password doesn't meet strength requirements.
      // A generic BadRequestException is suitable here to indicate a client-side error.
      throw new BadRequestException(
        'Failed to change password. Please ensure your old password is correct, the new password is not the same as the old one, and it meets all strength requirements.',
      );
    }
    return passwordChanged;
  }

  //TODO: REMOVE THIS: FOR TESTING
  @Get(':userId/resetpwd')
  @Public()
  async resetPwd(@Param() userId: any) {
    await this.usersService.restorePwd(userId.userId);

    return true;
  }
}
