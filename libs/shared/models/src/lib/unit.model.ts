import { BaseModel } from './_base.model';
import { UnitAssignmentModel } from './unit-assignment.model';

export class UnitModel extends BaseModel {
  street: string;
  identifier: string;
  status: string;

  assignations: UnitAssignmentModel[];
}
