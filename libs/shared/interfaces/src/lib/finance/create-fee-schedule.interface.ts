export interface ICreateFeeSchedule {
  name: string;
  description?: string;
  amount: number;
  type: string;
  status?: string;
  cronSchedule?: string;
  startDate?: string;
  endDate?: string;
}
