import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TransactionModel } from '@nex-house/models';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-cash-movement',
  imports: [Card, CurrencyPipe, DatePipe],
  templateUrl: './cash-movement.html',
  styleUrl: './cash-movement.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMovement {
  transaction = input.required<TransactionModel>();
}
