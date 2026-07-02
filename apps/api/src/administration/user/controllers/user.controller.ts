import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services';
import { User, Neighborhood } from '@core/database';
import { CurrentNeigh, CurrentUser } from '@core/decorators';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos';
import { NeighborhoodScopeGuard } from '@core/guards';

@Controller('neighborhoods/:neighborhoodId/users')
@UseGuards(NeighborhoodScopeGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

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
}
