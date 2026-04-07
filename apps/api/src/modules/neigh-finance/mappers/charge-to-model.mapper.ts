import { Charge } from '@database/entities';
import { UnitEntityToModel } from '@modules/housing-units/mappers';
import { ChargeModel } from '@nex-house/models';
import { FeeScheduleToModel } from './fee-schedule-to-model.mapper';
import { UserEntityToModel } from '@modules/users/mappers';

export function ChargeToModel(charge: Charge): ChargeModel {
  return {
    publicId: charge.publicId,
    unit: UnitEntityToModel(charge.unit),
    feeSchedule: FeeScheduleToModel(charge.feeSchedule),
    issuedToUser: UserEntityToModel(charge.issuedToUser),
    description: charge.description,
    amount: charge.amount / 1000,
    status: charge.status,
    dueDate: charge.dueDate,
    createdAt: charge.createdAt,
  };
}
