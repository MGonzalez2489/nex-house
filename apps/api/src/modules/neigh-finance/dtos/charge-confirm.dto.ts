import { ChargeConfirmModel } from '@nex-house/models';
import { IsOptional, IsString } from 'class-validator';

export class ChargeConfirmDto implements ChargeConfirmModel {
  @IsString()
  paymentDate: string;
  @IsString()
  approvalNotes: string;
  @IsString()
  @IsOptional()
  evidenceUrl?: string | undefined;
}
