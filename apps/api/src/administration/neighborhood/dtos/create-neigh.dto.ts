import { CreateNeighborhood } from '@nexhouse/shared-domain/interfaces';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateNeighborhoodDto implements CreateNeighborhood {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  streets: string[];
}
