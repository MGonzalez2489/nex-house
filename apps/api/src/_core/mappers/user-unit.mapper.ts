import { UserUnit } from '@core/database';
import { UserUnitModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { UnitToModelMapper } from './unit-to-model-mapper';

export const UserUnitToModel = (userUnit: UserUnit): UserUnitModel => {
  return {
    isCurrentOccupant: userUnit.isCurrentOccupant,
    userUnitRole: userUnit.userUnitRole
      ? CatalogToModelMapper(userUnit.userUnitRole)
      : undefined,
    unit: userUnit.unit ? UnitToModelMapper(userUnit.unit) : userUnit.unit,
    publicId: userUnit.publicId,
  };
};
