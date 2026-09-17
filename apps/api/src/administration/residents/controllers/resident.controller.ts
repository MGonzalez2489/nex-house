import { Neighborhood, User } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { NeighborhoodScopeGuard } from '@core/guards';
import { UserToModelMapper } from '@core/mappers';
import { PaginatedResult } from '@core/utils';
import { UserModel } from '@nexhouse/shared-domain/models';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateResidentDto, SearchUserDto, UpdateUserDto } from '../dtos';
import {
  ResidentSearchService,
  ResidentService,
  ResidentStatsService,
} from '../services';

@ApiTags('Residents')
@Controller('neighborhoods/:neighborhoodId/residents')
@UseGuards(NeighborhoodScopeGuard)
export class ResidentController {
  constructor(
    private readonly residentService: ResidentService,
    private readonly searchService: ResidentSearchService,
    private readonly statsService: ResidentStatsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a resident in the neighborhood' })
  @ApiResponse({
    status: 201,
    description: 'Resident created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or missing catalog references.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered.',
  })
  async create(
    @Body() dto: CreateResidentDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<User> {
    const response = await this.residentService.create(neigh.id, dto, user);

    if (!response) {
      throw new InternalServerErrorException('Resident not created.');
    }

    return response;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List residents of the neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of residents.',
  })
  async findAll(
    @Query() searchDto: SearchUserDto,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<PaginatedResult<UserModel>> {
    const response = await this.searchService.findAll(neigh.id, searchDto);

    return {
      ...response,
      data: response.data.map((user) => UserToModelMapper(user)),
    };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return resident statistics for the neighborhood' })
  @ApiResponse({
    status: 200,
    description: 'Returns aggregated resident counts by role and status.',
  })
  async findStats(@CurrentNeigh() neigh: Neighborhood) {
    return this.statsService.getStats(neigh.id);
  }

  @Get(':publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return a resident by publicId' })
  @ApiResponse({
    status: 200,
    description: 'Returns the resident details.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target resident could not be located.',
  })
  async findById(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<UserModel> {
    const response = await this.searchService.findByPublicId(
      publicId,
      neigh.id,
      {
        neighborhood: true,
        status: true,
        profile: true,
        role: true,
        userUnits: {
          unit: {
            street: true,
            type: true,
          },
          userUnitRole: true,
        },
      },
    );

    if (!response) {
      throw new NotFoundException('Resident not found.');
    }

    return UserToModelMapper(response);
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing resident' })
  @ApiParam({ name: 'publicId', description: 'The public UUID of the resident' })
  @ApiResponse({
    status: 200,
    description: 'Resident updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or missing catalog references.',
  })
  @ApiResponse({
    status: 404,
    description: 'Target resident could not be located.',
  })
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
    @CurrentNeigh() neigh: Neighborhood,
  ): Promise<User> {
    return this.residentService.update(neigh.id, publicId, dto, user);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update the authenticated resident avatar' })
  @ApiResponse({
    status: 200,
    description: 'Returns the resident with the updated avatar.',
  })
  async updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<User> {
    return this.residentService.updateAvatar(user.id, avatar);
  }
}