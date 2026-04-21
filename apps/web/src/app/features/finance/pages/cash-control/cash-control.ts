import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ModalService } from '@core/services';
import {
  CashFilters,
  CashForm,
  CashMovementList,
  CashSummary,
  CashTransactionInit,
} from '@features/finance/components';
import { FinanceStore } from '@features/finance/stores';
import { SearchTransaction } from '@nex-house/interfaces';
import { PageHeader } from '@shared/components/ui';
import { ContextStore } from '@stores/context.store';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cash-control',
  imports: [
    PageHeader,
    ButtonModule,
    CashSummary,
    CashFilters,
    CashMovementList,
    CashTransactionInit,
  ],
  templateUrl: './cash-control.html',
  styleUrl: './cash-control.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashControl {
  protected readonly modalService = inject(ModalService);
  protected readonly store = inject(FinanceStore);
  protected readonly contextStore = inject(ContextStore);

  protected readonly existsRecords = computed(() => {
    return true;
    // const pg = this.store.transactionsPagination();
    // const count = this.store.transactionsEntities().length;
    //
    // if (count === 0) return false;
    // if (!pg) return false;
    // if (pg.total === 0) return false;
    //
    // return true;
  });

  addMovement(): void {
    this.modalService.open(CashForm, { header: 'Registrar Movimiento' });
  }

  search(newFilters: SearchTransaction) {
    this.store.transactionsLoadAll(newFilters);
    const cFilters = this.store.transactionsFilters();
    if (!cFilters) {
      this.store.transactionsKpi(newFilters);
      return;
    }
    //
    if (
      newFilters.month !== cFilters.month ||
      newFilters.year !== cFilters.year
    ) {
      this.store.transactionsKpi(newFilters);
    }
  }
}
