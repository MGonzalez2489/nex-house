import { UnitModel } from '@nex-house/models';
import { UnitEntityToModel } from './unit-to-model';
import { HousingUnit } from '@database/entities';

export function UnitArrayToModelArray(units: HousingUnit[]): UnitModel[] {
  return units.map((u) => UnitEntityToModel(u));
}
