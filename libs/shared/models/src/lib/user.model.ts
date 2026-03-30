import { BaseModel } from './_base.model';
import { UnitAssignmentModel } from './unit-assignment.model';

export class UserModel extends BaseModel {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  assignments: UnitAssignmentModel[];
  status: string;
  neighborhoodId?: string;
}
