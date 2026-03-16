import { User } from '@database/entities';
import { UnitEntityToModel } from '@modules/housing-units/mappers';
import { UserModel } from '@nex-house/models';

export function UserEntityToModel(user: User): UserModel {
  const units = user.assignments?.map((f) => UnitEntityToModel(f.unit));

  return {
    publicId: user.publicId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    // fullName: user.firstName + ' ' + (user.lastName ?? ''),
    fullName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
    phone: user.phone,
    units,
  };
}
