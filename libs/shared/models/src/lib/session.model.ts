import { UserModel } from './user.model';

export class SessionModel {
  token: string;
  exp: number; //seconds
  user: UserModel;
}
