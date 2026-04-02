import { Module } from '@nestjs/common';
import { HousingUnitsService } from './housing-units.service';
import { HousingUnitsController } from './housing-units.controller';
import { HousingUnit } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeighborhoodsModule } from '@modules/neighborhoods';

@Module({
  imports: [TypeOrmModule.forFeature([HousingUnit]), NeighborhoodsModule],
  controllers: [HousingUnitsController],
  providers: [HousingUnitsService],
  exports: [HousingUnitsService],
})
export class HousingUnitsModule {}
