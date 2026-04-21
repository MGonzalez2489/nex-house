import { BaseModel } from './_base.model';

export class TransactionModel extends BaseModel {
  type: string;
  amount: number;
  sourceType: string;
  title: string;
  description: string;
  transactionDate: string;
}
