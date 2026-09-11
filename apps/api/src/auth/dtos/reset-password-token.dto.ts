import { ResetPasswordToken } from '@nexhouse/shared-domain/interfaces';

export class ResetPasswordTokenDto implements ResetPasswordToken {
  token: string;
  exp: number;
}
