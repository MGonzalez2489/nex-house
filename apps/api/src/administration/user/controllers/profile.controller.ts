import { User } from '@core/database';
import { CurrentUser, Public } from '@core/decorators';
import { UserToModelMapper } from '@core/mappers';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { UpdateUserProfileDto } from '../dtos';
import { ProfileService, UserSearchService, UserService } from '../services';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly usersService: UserService,
    private readonly userSearchService: UserSearchService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get a user profile' })
  async get(@CurrentUser() user: User) {
    const loadNeigh = user.role?.name !== UserRoleEnum.SUPERADMIN;

    const response = await this.userSearchService.findByPublicId(
      user.publicId,
      loadNeigh ? user.neighborhoodId : undefined,
      {
        neighborhood: loadNeigh,
        status: true,
        role: true,
        profile: { avatar: true },
        userUnits: { unit: { type: true, street: true } },
      },
    );
    return UserToModelMapper(response);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update a user' })
  async update(
    @Body() dto: UpdateUserProfileDto,
    @CurrentUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.profileService.update(user.publicId, dto, avatar);
  }

  //TODO: REMOVE THIS: FOR TESTING
  @Get(':userId/resetpwd')
  @Public()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async resetPwd(@Param() userId: any) {
    await this.usersService.restorePwd(userId.userId);

    return true;
  }
}
