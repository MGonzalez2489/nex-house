import { Neighborhood, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserStats } from '@nexhouse/shared-domain/interfaces';
import { UpdateUserDto } from '../dtos';
import { UserSearchService, UserService, UserStatsService } from '../services';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly statsService: UserStatsService,
    private readonly userSearchService: UserSearchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user with its relations' })
  async get(@CurrentUser() user: User): Promise<User> {
    return this.userSearchService.findByPublicIdOrThrow(
      user.publicId,
      undefined,
      {
        status: true,
        role: true,
        userUnits: { unit: { street: true, type: true }, userUnitRole: true },
      },
    );  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user metrics for the active neighborhood' })
  async findStats(@CurrentNeigh() neigh: Neighborhood): Promise<UserStats> {
    return this.statsService.getStats(neigh.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the authenticated user' })
  async update(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<User> {
    return this.usersService.update(neigh.id, user.publicId, dto, user);
  }
}
