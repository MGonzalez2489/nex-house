import { IsString, IsOptional, IsDateString } from 'class-validator';
import { SearchDto } from './search.dto';
import { SearchCharges } from '@nex-house/interfaces';

export class SearchChargeDto extends SearchDto implements SearchCharges {
  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  filterDate: string;

  @IsDateString()
  @IsOptional()
  from: string;

  @IsDateString()
  @IsOptional()
  to: string;
}
