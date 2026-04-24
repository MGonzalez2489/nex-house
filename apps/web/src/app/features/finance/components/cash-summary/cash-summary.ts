import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TransactionKpiModel } from '@nex-house/models';
import { Card } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-cash-summary',
  imports: [Card, CurrencyPipe, ProgressBarModule],
  templateUrl: './cash-summary.html',
  styleUrl: './cash-summary.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashSummary {
  summary = input<TransactionKpiModel>();

  protected readonly incomePercentage = computed(() => {
    const cSummary = this.summary();
    if (!cSummary) return;

    const percentage = (cSummary.incomeCount * 100) / cSummary.totalCount;

    return parseFloat(percentage.toFixed(2));
  });

  protected readonly expensePercentage = computed(() => {
    const cSummary = this.summary();
    if (!cSummary) return;

    const percentage = (cSummary.expenseCount * 100) / cSummary.totalCount;
    return parseFloat(percentage.toFixed(2));
  });
}
