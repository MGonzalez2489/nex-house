import { BaseModel } from './_base.model';
import { FeeScheduleModel } from './fee-schedule.model';
import { UnitModel } from './unit.model';
import { UserModel } from './user.model';

export class ChargeModel extends BaseModel {
  unit: UnitModel;
  feeSchedule: FeeScheduleModel;
  issuedToUser: UserModel;
  description: string;
  amount: number;
  status: string;
  dueDate: Date;
}
