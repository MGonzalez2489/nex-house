export interface ICreateFeeSchedule {
  name: string;
  description?: string;
  amount: number;
  type: string;
  startDate: string;

  //recurrence
  frecuency?: string; //weekly, monthly, yearly
  dayOfMonth?: number; // for monthly
  dayOfWeek?: number; // for weekly
  endDate?: string;
}
