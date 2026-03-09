export interface ICreateAccount {
  name: string;
  initialBalance: number;
  accountTypeId: string;

  bank?: string;
  accountNumber?: string;
}
