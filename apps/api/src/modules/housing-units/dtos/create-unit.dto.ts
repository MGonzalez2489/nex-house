import { ICreateHousingUnit } from '@nex-house/interfaces';

export class CreateHousingUnitDto implements ICreateHousingUnit {
  identifier: string;
  streetName: string;
}
