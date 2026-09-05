import { Neighborhood, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
  async get(@CurrentUser() user: User) {
    return this.userSearchService.findByPublicIdOrThrow(
      user.publicId,
      undefined,
      {
        status: true,
        role: true,
        userUnits: { unit: true, userUnitRole: true },
      },
    );
  }

  //TODO: convert statos into own stats
  @Get('stats')
  async findStats(@CurrentNeigh() neigh: Neighborhood) {
    return await this.statsService.getStats(neigh.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'publicId', description: 'The public UUID of the user' })
  async update(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    //TODO: rework update to reduce params number
    return await this.usersService.update(neigh.id, user.publicId, dto, user);
  }
}
