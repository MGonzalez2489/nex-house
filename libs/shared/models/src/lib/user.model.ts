import { BaseModel } from './_base.model';
import { UnitModel } from './unit.model';

export class UserModel extends BaseModel {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  units: UnitModel[];
}
