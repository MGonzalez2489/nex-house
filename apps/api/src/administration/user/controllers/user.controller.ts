import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserSearchService, UserService } from '../services';
import { User, Neighborhood } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from '../dtos';
import { NeighborhoodScopeGuard } from '@core/guards';

@Controller('neighborhoods/:neighborhoodId/users')
@UseGuards(NeighborhoodScopeGuard)
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly searchService: UserSearchService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    const response = await this.usersService.create(neigh.id, dto, user);
    if (!response) {
      throw new InternalServerErrorException('Used not created.');
    }
    return response;
  }

  @Get()
  async findAll(
    @Query() searchDto: SearchUserDto,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return await this.searchService.findAll(neigh.id, searchDto);
  }

  @Get(':publicId')
  async findById(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return await this.searchService.findByPublicId(publicId, neigh.id);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'publicId', description: 'The public UUID of the user' })
  async update(
    @Param('publicId') publicId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ) {
    return await this.usersService.update(neigh.id, publicId, dto, user);
  }
}
