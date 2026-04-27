import { Controller } from '@nestjs/common';
import { NeighFinanceService } from '../services/neigh-finance.service';

@Controller('neigh-finance')
export class NeighFinanceController {
  constructor(private readonly neighFinanceService: NeighFinanceService) {}
}
