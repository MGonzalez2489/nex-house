import { User, UserProfile } from '@core/database';
import { CurrentUser } from '@core/decorators';
import { UserProfileToModelMapper } from '@core/mappers';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserProfileModel } from '@nexhouse/shared-domain/models';
import { UpdateUserProfileDto } from '../dtos';
import { ProfileService } from '../services';

@ApiTags('Profile')
@Controller('user/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  async get(@CurrentUser() user: User): Promise<UserProfileModel> {
    const profile = await this.profileService.getByUserId(user.id);

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return UserProfileToModelMapper(profile);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update the profile of the authenticated user' })
  async update(
    @Body() dto: UpdateUserProfileDto,
    @CurrentUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UserProfile | null> {
    return this.profileService.update(user.publicId, dto, avatar);
  }
}
