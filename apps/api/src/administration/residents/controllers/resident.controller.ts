import { Neighborhood, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UserToModelMapper } from '@core/mappers';
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateResidentDto, SearchUserDto, UpdateUserDto } from '../dtos';
import {
  ResidentSearchService,
  ResidentService,
  ResidentStatsService,
} from '../services';

@Controller('neighborhoods/:neighborhoodId/residents')
@UseGuards(NeighborhoodScopeGuard)
export class ResidentController {
  constructor(
    private readonly usersService: ResidentService,
    private readonly searchService: ResidentSearchService,
    private readonly statsService: ResidentStatsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  async create(
    @Body() dto: CreateResidentDto,
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
    const response = await this.searchService.findAll(neigh.id, searchDto);

    const mResponse = {
      ...response,
      data: response.data.map((f) => UserToModelMapper(f)),
    };
    return mResponse;
  }

  @Get('stats')
  async findStats(@CurrentNeigh() neigh: Neighborhood) {
    return await this.statsService.getStats(neigh.id);
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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return await this.usersService.updateAvatar(user.id, avatar);
    // return this.Response(result);
  }
}
