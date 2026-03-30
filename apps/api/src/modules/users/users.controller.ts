import { CurrentUser } from '@common/decorators';
import { SearchDto, SearchUserDto } from '@common/dtos';
import { User } from '@database/entities';
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
    @Query() searchDto: SearchUserDto,
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
  @Get(':publicId')
  async findById(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ) {
    const result = await this.usersService.findByPublicId(publicId);

    if (!result) {
      throw new NotFoundException('Used not found.');
    }

    return UserEntityToModel(result);
  }

  @Patch(':publicId')
  async update(
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
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
    @Param('neighborhoodId', ParseUUIDPipe) neighborhoodId: string,
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.remove(publicId, user);
  }
}
