export interface SessionModel {
  token: string;
  refreshToken: string;
  exp: number; //seconds
}
