import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TransactionTypeEnum } from '@nex-house/enums';
import { TransactionModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transaction-view',
  imports: [CurrencyPipe, DatePipe, ButtonModule],
  templateUrl: './transaction-view.html',
  styleUrl: './transaction-view.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionView {
  transaction = input.required<TransactionModel>();

  isIncome = computed(
    () => this.transaction().type === TransactionTypeEnum.INCOME,
  );
  hasEvidence = computed(
    () =>
      this.transaction().evidenceUrl && this.transaction().evidenceUrl !== '',
  );

  url = computed(() => this.transaction().evidenceUrl?.split('/')[1]);

  viewEvidence() {
    window.open(`public/${this.transaction().evidenceUrl}`, '_blank');
  }
}
