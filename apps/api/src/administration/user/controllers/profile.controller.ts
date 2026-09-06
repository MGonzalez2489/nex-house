import { User } from '@core/database';
import { CurrentUser, Public } from '@core/decorators';
import { UserProfileToModelMapper } from '@core/mappers';
import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserProfileDto } from '../dtos';
import { ProfileService, UserService } from '../services';

@ApiTags('User')
@Controller('user/profile')
export class ProfileController {
  constructor(
    private readonly usersService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get a user profile' })
  async get(@CurrentUser() user: User) {
    const response = await this.profileService.getByUserId(user.id);
    return UserProfileToModelMapper(response);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update a user' })
  async update(
    @Body() dto: UpdateUserProfileDto,
    @CurrentUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return await this.profileService.update(user.publicId, dto, avatar);
  }

  //TODO: REMOVE THIS: FOR TESTING
  @Get('resetpwd')
  @Public()
  async resetPwd(@CurrentUser() user: User) {
    await this.usersService.restorePwd(user.id);

    return true;
  }
}
