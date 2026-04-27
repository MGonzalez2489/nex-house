import { CurrentNeigh, CurrentUser } from '@common/decorators';
import { SearchUserDto } from '@common/dtos';
import { Neighborhood, User } from '@database/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
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
    @Body() createDto: CreateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const response = await this.usersService.create(neigh, createDto, user);
    if (!response) {
      throw new InternalServerErrorException('Used not created.');
    }
    return UserEntityToModel(response);
  }

  @Get()
  async findAll(
    @Query() searchDto: SearchUserDto,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const searchResult = await this.usersService.findAll(neigh.id, searchDto);
    return {
      meta: searchResult.meta,
      data: searchResult.data.map((user) => UserEntityToModel(user)),
    };
  }
  @Get(':publicId')
  async findById(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const result = await this.usersService.findByPublicId(publicId, neigh.id);

    if (!result) {
      throw new NotFoundException('Used not found.');
    }

    return UserEntityToModel(result);
  }

  @Patch(':publicId')
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() createDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.usersService.update(publicId, createDto, user);

    if (!result) {
      throw new NotFoundException('Used not found.');
    }

    return UserEntityToModel(result);
  }

  @Delete(':publicId')
  async delete(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return await this.usersService.remove(publicId, user, neigh);
  }
}
