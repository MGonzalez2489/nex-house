import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ModalService } from '@core/services';
import {
  CashFilters,
  CashFiltersChips,
  CashForm,
  CashMovementList,
  CashSummary,
  CashTransactionInit,
} from '@features/finance/components';
import { CashTransactionsTable } from '@features/finance/components/cash-transactions-table/cash-transactions-table';
import { TransactionView } from '@features/finance/components/transaction-view/transaction-view';
import { FinanceStore } from '@features/finance/stores';
import { SearchTransaction } from '@nex-house/interfaces';
import { TransactionModel } from '@nex-house/models';
import { PageHeader } from '@shared/components/ui';
import { ContextStore } from '@stores/context.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-cash-control',
  imports: [
    PageHeader,
    ButtonModule,
    CashSummary,
    CashMovementList,
    CashTransactionInit,
    OverlayBadgeModule,
    CashFiltersChips,
    CashTransactionsTable,
    Card,
    ConfirmDialogModule,
  ],
  templateUrl: './cash-control.html',
  styleUrl: './cash-control.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class CashControl implements OnInit {
  protected readonly modalService = inject(ModalService);
  protected readonly store = inject(FinanceStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly confirmationService = inject(ConfirmationService);

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

  constructor() {
    // effect(() => {
    //   const c = this.store.transactionsEntities();
    //   if (!c) return;
    //
    //   const f = c[0];
    //   if (!f) return;
    //
    //   this.view(f);
    // });
  }

  protected readonly filterCount = computed(() => {
    const cFilters = this.store.transactionsFilters();
    if (!cFilters) return 0;

    let count = 0;
    if (cFilters.globalFilter) count++;
    if (cFilters.month && cFilters.year) count++;

    return count;
  });

  ngOnInit(): void {
    let filters = this.store.transactionsFilters();
    if (!filters) {
      const today = new Date();
      filters = {
        rows: 10,
        first: 0,
        month: today.getMonth(),
        year: today.getFullYear(),
      };
      this.search(filters);
    }
    // this.addMovement();
  }

  addMovement(): void {
    this.modalService.open(CashForm, { header: 'Registrar Movimiento' });
  }

  changeFilters(): void {
    this.modalService.open(CashFilters, {
      header: 'Filtrar transacciones',
      width: '25vw',
      inputValues: {
        filters: this.store.transactionsFilters(),
      },
    });
  }

  removeFilter(key: string) {
    const cFilters = Object.assign({}, this.store.transactionsFilters());
    if (!cFilters) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (cFilters as any)[key];

    this.search(cFilters);
  }

  search(newFilters: SearchTransaction) {
    newFilters.month++;
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

  view(transaction: TransactionModel) {
    this.modalService.open(TransactionView, {
      showHeader: false,
      width: '50vw',
      contentStyle: { padding: 0 },
      inputValues: {
        transaction,
      },
    });
  }
  update(transaction: TransactionModel) {
    this.modalService.open(CashForm, {
      header: 'Actualizar Movimiento',
      inputValues: { existing: transaction },
    });
  }
  delete(transaction: TransactionModel) {
    console.log('entro al delete');

    this.confirmationService.confirm({
      header: 'Confirmar Anulación',
      message: `¿Estás seguro de anular "${transaction.title}"?`,
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      blockScroll: true,

      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptLabel: 'Anular Movimiento',
      acceptButtonProps: { label: 'Anular Movimiento', severity: 'danger' },
      accept: () => {
        this.store.TransactionRemove(transaction.publicId);
      },
    });
    // this.store.TransactionRemove(transaction.publicId);
  }
}
