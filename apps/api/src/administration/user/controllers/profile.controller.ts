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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { UpdateUserProfileDto } from '../dtos';
import { ProfileService, UserSearchService, UserService } from '../services';

@ApiTags('User')
@Controller('user/profile')
export class ProfileController {
  constructor(
    private readonly usersService: UserService,
    private readonly userSearchService: UserSearchService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get a user profile' })
  async get(@CurrentUser() user: User) {
    const response = await this.getFullUser(user);
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
    await this.profileService.update(user.publicId, dto, avatar);
    const response = await this.getFullUser(user);
    return UserToModelMapper(response);
  }

  //TODO: REMOVE THIS: FOR TESTING
  @Get('resetpwd')
  @Public()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async resetPwd(@CurrentUser() user: User) {
    await this.usersService.restorePwd(user.id);

    return true;
  }

  private async getFullUser(user: User) {
    const loadNeigh = user.role?.name !== UserRoleEnum.SUPERADMIN;

    return await this.userSearchService.findByPublicId(
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
  }
}
