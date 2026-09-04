import { BaseModel } from './_base.model';
import { FileModel } from './file.model';

export interface UserProfileModel extends BaseModel {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar?: FileModel;
}
