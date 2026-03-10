import { User } from '@database/entities';
import { UserModel } from '@nex-house/models';

export function UserEntityToModel(user: User): UserModel {
  return {
    publicId: user.publicId,
    email: user.email,
    role: user.role,
  };
}
