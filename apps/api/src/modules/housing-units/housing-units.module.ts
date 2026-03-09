import { Module } from '@nestjs/common';
import { HousingUnitsService } from './housing-units.service';
import { HousingUnitsController } from './housing-units.controller';

@Module({
  controllers: [HousingUnitsController],
  providers: [HousingUnitsService],
})
export class HousingUnitsModule {}
