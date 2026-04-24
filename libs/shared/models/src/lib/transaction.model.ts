import { BaseModel } from './_base.model';
import { TransactionCategoryModel } from './transaction_category.model';
import { UserModel } from './user.model';

export class TransactionModel extends BaseModel {
  type: string;
  amount: number;
  sourceType: string;
  title: string;
  description: string;
  transactionDate: string;
  evidenceUrl?: string;
  createdBy?: UserModel;
  category: TransactionCategoryModel;
}
