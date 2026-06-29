import { Module } from '@nestjs/common';
import { NeighborhoodSearchService, NeighborhoodService } from './services';
import { NeighborhoodController } from './controller';
import { Neighborhood } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Neighborhood])],
  providers: [NeighborhoodSearchService, NeighborhoodService],
  controllers: [NeighborhoodController],
})
export class NeighborhoodModule {}
