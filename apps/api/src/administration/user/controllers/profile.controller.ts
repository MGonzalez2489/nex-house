import { User } from '@core/database';
import { CurrentUser, Public } from '@core/decorators';
import { UserToModelMapper } from '@core/mappers';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@nexhouse/shared-domain/enums';
import { UpdateUserDto } from '../dtos';
import { UserSearchService, UserService } from '../services';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly usersService: UserService,
    private readonly userSearchService: UserSearchService,
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
        profile: true,
        userUnits: { unit: { type: true, street: true } },
      },
    );
    return UserToModelMapper(response);
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
    return UserToModelMapper(response);
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
