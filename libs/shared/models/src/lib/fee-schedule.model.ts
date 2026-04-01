import { BaseModel } from './_base.model';

export class FeeScheduleModel extends BaseModel {
  name: string;
  description: string;
  amount: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}
