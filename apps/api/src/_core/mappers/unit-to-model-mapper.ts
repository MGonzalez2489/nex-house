import { Unit } from '@core/database';
import { UnitModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { NeighStreetToModel } from './neigh-street-to-model.mapper';
import { UserUnitToModel } from './user-unit.mapper';

export const UnitToModelMapper = (unit: Unit): UnitModel => {
  return {
    identifier: unit.identifier,
    type: CatalogToModelMapper(unit.type),
    street: NeighStreetToModel(unit.street),
    publicId: unit.publicId,

    userUnits: unit.userUnits
      ? unit.userUnits.map((f) => UserUnitToModel(f))
      : [],
  };
};
