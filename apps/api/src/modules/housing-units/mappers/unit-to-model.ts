import { HousingUnit } from '@database/entities';
import { UnitModel } from '@nex-house/models';
import { AssignmentArrayToModelArray } from './assignment-to-model';

export function UnitEntityToModel(unit: HousingUnit): UnitModel {
  return {
    publicId: unit.publicId,
    street: unit.streetName,
    identifier: unit.identifier,
    status: unit.status,
    assignations: unit.assignments
      ? AssignmentArrayToModelArray(unit.assignments)
      : [],
  };
}

export function UnitArrayToModelArray(units: HousingUnit[]): UnitModel[] {
  return units.map((u) => UnitEntityToModel(u));
}
