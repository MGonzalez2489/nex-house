import { Module } from '@nestjs/common';
import { HousingUnitsService } from './housing-units.service';
import { HousingUnitsController } from './housing-units.controller';
import { HousingUnit } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HousingUnit])],
  controllers: [HousingUnitsController],
  providers: [HousingUnitsService],
})
export class HousingUnitsModule {}
