import { User } from '@database/entities';
import { AssignmentArrayToModelArray } from '@modules/housing-units/mappers';
import { UserModel } from '@nex-house/models';

export function UserEntityToModel(user: User): UserModel {
  const assignments = user.assignments ?? [];

  return {
    publicId: user.publicId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
    phone: user.phone,
    assignments: AssignmentArrayToModelArray(assignments),
    status: user.status,
  };
}
