import { BaseModel } from './_base.model';

export class UnitModel extends BaseModel {
  street: string;
  identifier: string;
  status: string;

  isAssigned: boolean;
  isOwner: boolean;
  isFamily: boolean;
  isTenant: boolean;
}
