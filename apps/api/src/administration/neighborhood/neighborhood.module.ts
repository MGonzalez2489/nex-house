import { Module } from '@nestjs/common';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from './services';
import { NeighborhoodController } from './controller';
import { Neighborhood, NeighStreet } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Neighborhood, NeighStreet])],
  providers: [
    NeighborhoodSearchService,
    NeighborhoodService,
    NeighStreetService,
  ],
  controllers: [NeighborhoodController],
})
export class NeighborhoodModule {}
