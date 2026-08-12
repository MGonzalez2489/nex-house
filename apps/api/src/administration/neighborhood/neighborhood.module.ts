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
import { NeighSearchController } from './controller/neigh-search.controller';
import { CatalogsModule } from 'src/catalogs';

@Module({
  imports: [
    TypeOrmModule.forFeature([Neighborhood, NeighStreet, Unit, UserUnit]),
    UserModule,
    CatalogsModule,
  ],
  providers: [
    NeighborhoodSearchService,
    NeighborhoodService,
    NeighStreetService,
  ],
  controllers: [NeighborhoodController, NeighSearchController],
})
export class NeighborhoodModule {}
