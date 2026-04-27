import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TransactionTypeEnum } from '@nex-house/enums';
import { TransactionModel } from '@nex-house/models';
import { FileSizePipe } from '@shared/pipes';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-transaction-view',
  imports: [CurrencyPipe, DatePipe, ButtonModule, FileSizePipe, ButtonModule],
  templateUrl: './transaction-view.html',
  styleUrl: './transaction-view.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionView {
  readonly transaction = input.required<TransactionModel>();
  private readonly ref = inject(DynamicDialogRef);

  isIncome = computed(
    () => this.transaction().type === TransactionTypeEnum.INCOME,
  );
  hasEvidence = computed(() => this.transaction().evidence);

  url = computed(() => this.transaction().evidence?.fileName);

  viewEvidence() {
    window.open(`public/${this.transaction().evidence?.url}`, '_blank');
  }
  close() {
    this.ref.close();
  }
}
