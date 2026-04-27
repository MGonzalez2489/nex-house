import { BaseModel } from './_base.model';

export class TransactionCategoryModel extends BaseModel {
  name: string;
  description: string;
  icon: string;
  color: string;
  allowedType: string;
}
