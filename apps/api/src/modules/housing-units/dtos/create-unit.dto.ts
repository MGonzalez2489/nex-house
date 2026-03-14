import { ICreateHousingUnit } from '@nex-house/interfaces';
import { IsString } from 'class-validator';

export class CreateHousingUnitDto implements ICreateHousingUnit {
  @IsString()
  identifier: string;
  @IsString()
  streetName: string;
}
