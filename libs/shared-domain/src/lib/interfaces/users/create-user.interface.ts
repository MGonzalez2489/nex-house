import { CreateUnit } from '../units';

export interface CreateUser {
  //general
  email: string;
  userRoleId: string;

  //unit
  unit: CreateUnit;
}
