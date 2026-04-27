import { Search } from '@nex-house/interfaces';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class SearchDto implements Search {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  first = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  rows = 10;

  @IsOptional()
  @IsString()
  sortField = 'createdAt';

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, -1])
  sortOrder = -1;

  @IsOptional()
  @IsString()
  globalFilter?: string;

  @IsBoolean()
  @IsOptional()
  showAll: boolean;
}
