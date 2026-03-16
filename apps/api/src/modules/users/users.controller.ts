import { CurrentUser } from '@common/decorators';
import { SearchDto } from '@common/dtos';
import { User } from '@database/entities';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos';
import { UserEntityToModel } from './mappers';
import { UsersService } from './users.service';

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
    const response = await this.usersService.create(
      neighborhoodId,
      createDto,
      user,
    );
    if (!response) {
      throw new InternalServerErrorException('Used not created.');
    }
    return UserEntityToModel(response);
  }

  @Get()
  async findAll(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Query() searchDto: SearchDto,
  ) {
    const searchResult = await this.usersService.findAll(
      neighborhoodId,
      searchDto,
    );
    return {
      meta: searchResult.meta,
      data: searchResult.data.map((user) => UserEntityToModel(user)),
    };
  }
}
