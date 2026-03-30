import { ICreateNeighborhood } from '@nex-house/interfaces';
import { IsString } from 'class-validator';

export class CreateNeighborhoodDto implements ICreateNeighborhood {
  @IsString()
  name: string;
  @IsString()
  slug: string;
  @IsString()
  address: string;
}
