export interface ICreateTransaction {
  type: string;
  amount: number;
  sourceType: string;
  transactionDate: string;
  title: string;
  description: string;
  evidence?: string;
}
