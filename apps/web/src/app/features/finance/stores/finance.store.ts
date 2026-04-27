import { withDevtools, withReset } from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';
import { withFeeScheduleFeature } from './_fee-schedule.store';
import { withChargeFeature } from './_charge.store';
import { withTransactionsFeature } from './_transactions.store';

// interface FinanceState {
//   neighborhoodId: string | null;
// }
//
// const initialState: FinanceState = {
//   neighborhoodId: null,
// };

export const FinanceStore = signalStore(
  { providedIn: 'root' },
  withDevtools('finance'),
  // withState(initialState),
  withReset(),
  // withCallState(),
  withFeeScheduleFeature(),
  withChargeFeature(),
  withTransactionsFeature(),
);
