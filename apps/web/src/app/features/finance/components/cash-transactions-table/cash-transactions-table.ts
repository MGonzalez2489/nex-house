import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ApiPaginationMeta } from '@nex-house/interfaces';
import { TransactionModel } from '@nex-house/models';
import { Table, TableColumn } from '@shared/components/data';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-cash-transactions-table',
  imports: [Table, DatePipe, CurrencyPipe, ButtonModule, MenuModule],
  templateUrl: './cash-transactions-table.html',
  styleUrl: './cash-transactions-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashTransactionsTable {
  //inputs
  transactions = input.required<TransactionModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();

  //outputs
  view = output<TransactionModel>();
  update = output<TransactionModel>();
  delete = output<TransactionModel>();

  //internal
  protected readonly selected = signal<TransactionModel | undefined>(undefined);

  protected cols: TableColumn<TransactionModel>[] = [
    { field: 'transactionDate', header: 'Fecha' },
    { field: 'title', header: 'Concepto' },
    // {field:'category',header:'Categori'},
    { field: 'amount', header: 'Monto' },
    { field: 'category', header: 'Categoria' },
  ];

  protected items = computed<MenuItem[]>(() => {
    return [
      {
        label: 'Ver',
        icon: PrimeIcons.SEARCH,
        command: () => {
          const cSel = this.selected();
          if (cSel) this.view.emit(cSel);
        },
      },
      {
        label: 'Editar',
        icon: PrimeIcons.PENCIL,
        command: () => {
          const cSel = this.selected();
          if (cSel) this.update.emit(cSel);
        },
      },
      { separator: true },
      {
        label: 'Borrar',
        icon: PrimeIcons.TRASH,
        labelClass: 'text-rose-500',
        iconClass: 'text-rose-500',
        command: () => {
          const cSel = this.selected();
          if (cSel) this.delete.emit(cSel);
        },
      },
    ];
  });
}
