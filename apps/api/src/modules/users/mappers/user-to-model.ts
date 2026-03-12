import { User } from '@database/entities';
import { UserModel } from '@nex-house/models';

export function UserEntityToModel(user: User): UserModel {
  return {
    publicId: user.publicId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.firstName + ' ' + user.lastName,
    phone: user.phone,
  };
}
