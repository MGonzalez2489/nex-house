import { FeeSchedule } from '@database/entities';
import { FeeScheduleModel } from '@nex-house/models';

export function FeeScheduleToModel(fee: FeeSchedule): FeeScheduleModel {
  return {
    publicId: fee.publicId,

    name: fee.name,
    description: fee.description,
    amount: fee.amount / 1000,
    type: fee.type,
    startDate: fee.startDate?.toString(),
    endDate: fee.endDate?.toString(),
    status: fee.status,

    cronSchedule: fee.cronSchedule,
    cronDescription: fee.cronDescription,

    totalCollected: 0,
    executionCount: 0,
  };
}
