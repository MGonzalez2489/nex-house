import {
  CreateNeighborhood,
  CreateNeighStreet,
} from '@nexhouse/shared-domain/interfaces';
import { ArrayMinSize, IsArray, IsBoolean, IsString } from 'class-validator';

export class CreateNeighborhoodDto implements CreateNeighborhood {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  streets: CreateNeighStreet[];

  @IsBoolean()
  isActive: boolean;
}
