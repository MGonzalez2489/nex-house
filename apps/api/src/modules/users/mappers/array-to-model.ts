import { User } from '@database/entities';
import { UserModel } from '@nex-house/models';
import { UserEntityToModel } from './user-to-model';

export function UserArrayToModelArray(users: User[]): UserModel[] {
  return users.map((u) => UserEntityToModel(u));
}
