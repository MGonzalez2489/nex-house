import { ChargeCancelModel } from '@nex-house/models';
import { IsString } from 'class-validator';

export class ChargeCancelDto implements ChargeCancelModel {
  @IsString()
  cancelReason: string;
}
