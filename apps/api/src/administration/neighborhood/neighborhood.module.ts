import { ResidentModule } from '@administration/residents/resident.module';
import { Neighborhood, NeighStreet, Unit, UserUnit } from '@core/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs/catalogs.module';
import { NeighborhoodController } from './controller';
import { NeighSearchController } from './controller/neigh-search.controller';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Neighborhood, NeighStreet, Unit, UserUnit]),
    ResidentModule,
    CatalogsModule,
  ],
  providers: [
    NeighborhoodSearchService,
    NeighborhoodService,
    NeighStreetService,
  ],
  controllers: [NeighborhoodController, NeighSearchController],
  exports: [NeighStreetService],
})
export class NeighborhoodModule {}
