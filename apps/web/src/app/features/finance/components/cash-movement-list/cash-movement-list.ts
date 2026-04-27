import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GroupedTransactionList } from '@features/finance/stores/_transactions.store';
import { CashMovement } from '../cash-movement/cash-movement';
import { DatePipe } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-cash-movement-list',
  imports: [CashMovement, DatePipe, ProgressSpinnerModule],
  templateUrl: './cash-movement-list.html',
  styleUrl: './cash-movement-list.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMovementList {
  records = input.required<GroupedTransactionList[]>();
  isLoading = input<boolean>(false);
}
