import { SearchTransaction } from '@nex-house/interfaces';
import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { SearchDto } from './search.dto';

export class SearchTransactionDto
  extends SearchDto
  implements SearchTransaction
{
  @IsString()
  @IsOptional()
  category: string;

  @IsNumberString()
  month: number;

  @IsNumberString()
  year: number;
}
