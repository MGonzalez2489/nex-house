import { CreateNeighborhood } from '@nexhouse/shared-domain/interfaces';
import { IsString, MinLength } from 'class-validator';

export class CreateNeighborhoodDto implements CreateNeighborhood {
  @IsString()
  name: string;

  @IsString()
  @MinLength(1)
  streets: string[];
}
