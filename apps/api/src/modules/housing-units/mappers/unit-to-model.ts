import { HousingUnit, UnitAssignment } from '@database/entities';
import { UnitModel } from '@nex-house/models';

export function UnitEntityToModel(
  unit: HousingUnit,
  assignment?: UnitAssignment,
): UnitModel {
  return {
    publicId: unit.publicId,
    street: unit.streetName,
    identifier: unit.identifier,
    status: unit.status,

    isAssigned: !!assignment,
    isFamily: !!assignment?.isFamily,
    isOwner: !!assignment?.isOwner,
    isTenant: !!assignment?.isTenant,
  };
}
