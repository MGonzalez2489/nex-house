import { BaseModel } from './_base.model';

export interface UserProfileModel extends BaseModel {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar: string;
}
