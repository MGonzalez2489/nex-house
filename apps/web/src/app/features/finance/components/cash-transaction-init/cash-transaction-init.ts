import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-cash-transaction-init',
  imports: [Button],
  templateUrl: './cash-transaction-init.html',
  styleUrl: './cash-transaction-init.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashTransactionInit {
  add = output();
}
