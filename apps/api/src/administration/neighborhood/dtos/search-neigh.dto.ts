import { SearchDto } from '@core/dtos';
import { SearchNeigh } from '@nexhouse/shared-domain/interfaces';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class SearchNeighDto extends SearchDto implements SearchNeigh {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;

    return;
  })
  @IsBoolean()
  isActive?: boolean;
}
