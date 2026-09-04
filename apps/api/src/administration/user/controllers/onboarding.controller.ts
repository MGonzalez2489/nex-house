import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OnboardingService, ProfileService, UserService } from '../services';
import { User } from '@core/database';
import { CurrentUser } from '@core/decorators';
import {
  ChangePasswordDto,
  OnboardingStatusResponseDto,
  UpdateUserProfileDto,
} from '../dtos';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnitService } from '@administration/units/services';
import { CreateUnitDto } from '@administration/neighborhood/dtos';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly unitsService: UnitService,
  ) {}

  @Get('status')
  async getStatus(
    @CurrentUser() user: User,
  ): Promise<OnboardingStatusResponseDto> {
    return this.onboardingService.getOnboardingStatus(user.publicId);
  }

  @Patch('security')
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
  ): Promise<OnboardingStatusResponseDto> {
    const passwordChanged: boolean = await this.userService.changePassword(
      user.publicId,
      dto.oldPassword,
      dto.newPassword,
    );

    if (!passwordChanged) {
      throw new BadRequestException(
        'Failed to change password. Please ensure your old password is correct, the new password is not the same as the old one, and it meets all strength requirements.',
      );
    }
    return this.onboardingService.getOnboardingStatus(user.publicId);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Body() dto: UpdateUserProfileDto,
    @CurrentUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const updatedProfile = await this.profileService.update(
      user.publicId,
      dto,
      avatar,
    );

    if (!updatedProfile) {
      throw new InternalServerErrorException('Failed to update user profile.');
    }

    return this.onboardingService.getOnboardingStatus(user.publicId);
  }

  @Post('unit')
  async createUnit(
    @Body() dto: CreateUnitDto,
    @CurrentUser() user: User,
  ): Promise<OnboardingStatusResponseDto> {
    await this.unitsService.create(user.neighborhoodId, dto, user.id);
    return this.onboardingService.getOnboardingStatus(user.publicId);
  }

  @Post('complete')
  async complete(@CurrentUser() user: User): Promise<{ success: boolean }> {
    await this.onboardingService.completeOnboarding(user.id);
    return { success: true };
  }
}
