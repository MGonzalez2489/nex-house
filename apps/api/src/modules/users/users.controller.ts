import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos';
import { UsersService } from './users.service';
import { CurrentUser } from '@common/decorators';
import { User } from '@database/entities';

@ApiTags('Users')
@Controller('neighborhoods/:neighborhoodId/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  async create(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Body() createDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.create(neighborhoodId, createDto, user);
  }
}
