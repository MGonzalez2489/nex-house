import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TransactionKpiModel } from '@nex-house/models';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-cash-summary',
  imports: [Card, CurrencyPipe],
  templateUrl: './cash-summary.html',
  styleUrl: './cash-summary.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashSummary {
  summary = input<TransactionKpiModel>();
}
