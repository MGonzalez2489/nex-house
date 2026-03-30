import { UnitAssignment } from '@database/entities';
import { UserEntityToModel } from '@modules/users/mappers';
import { UnitAssignmentModel } from '@nex-house/models';
import { UnitEntityToModel } from './unit-to-model';

export function AssignmentToModel(
  assignment: UnitAssignment,
): UnitAssignmentModel {
  return {
    publicId: assignment.publicId,
    isFamily: assignment.isFamily,
    isOwner: assignment.isOwner,
    isTenant: assignment.isTenant,
    user: assignment.user ? UserEntityToModel(assignment.user) : undefined,
    unit: assignment.unit ? UnitEntityToModel(assignment.unit) : undefined,
  };
}

export function AssignmentArrayToModelArray(
  assignments: UnitAssignment[],
): UnitAssignmentModel[] {
  return assignments.map((f) => AssignmentToModel(f));
}
