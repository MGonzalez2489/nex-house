import { BaseModel } from './_base.model';

export class UserModel extends BaseModel {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
}
