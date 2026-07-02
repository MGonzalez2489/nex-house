import { UserAssignUnit } from './user-assign-unit.interface';

export interface CreateUser {
  //general
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;

  //relationships
  roleId: string;

  //TODO: should it be array
  assignUnits: UserAssignUnit;
}
