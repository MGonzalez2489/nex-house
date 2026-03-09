import { Controller } from '@nestjs/common';
import { HousingUnitsService } from './housing-units.service';

@Controller('housing-units')
export class HousingUnitsController {
  constructor(private readonly housingUnitsService: HousingUnitsService) {}
}
