import { UserModel } from './user.model';

export interface SessionModel {
  token: string;
  refreshToken: string;
  exp: number; //seconds
  user: UserModel;
}
