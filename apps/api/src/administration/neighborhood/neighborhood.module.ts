import { Module } from '@nestjs/common';
import {
  NeighborhoodSearchService,
  NeighborhoodService,
  NeighStreetService,
} from './services';
import { NeighborhoodController } from './controller';
import { Neighborhood, NeighStreet, Unit, UserUnit } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@administration/user/user.module';
import { NeighUnitsService } from './services/neigh-units.service';
import { NeighSearchController } from './controller/neigh-search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Neighborhood, NeighStreet, Unit, UserUnit]),
    UserModule,
  ],
  providers: [
    NeighborhoodSearchService,
    NeighborhoodService,
    NeighStreetService,
    NeighUnitsService,
  ],
  controllers: [NeighborhoodController, NeighSearchController],
})
export class NeighborhoodModule {}
