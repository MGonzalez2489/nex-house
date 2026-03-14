import { HousingUnit } from '@database/entities';
import { UnitModel } from '@nex-house/models';

export function UnitEntityToModel(unit: HousingUnit): UnitModel {
  return {
    publicId: unit.publicId,
    street: unit.streetName,
    identifier: unit.identifier,
    status: unit.status,
  };
}
