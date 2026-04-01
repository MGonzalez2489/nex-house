import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { FeeScheduleModel } from '@nex-house/models';
import { Table, TableColumn } from '@shared/components/data';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-fee-schedule-table',
  imports: [Table, ButtonModule, DatePipe, CurrencyPipe],
  templateUrl: './fee-schedule-table.html',
  styleUrl: './fee-schedule-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleTable {
  readonly data = input.required<FeeScheduleModel[]>();
  readonly isLoading = input.required<boolean>();
  readonly pagination = input<ApiPaginationMeta>();

  filter = output<Search>();
  inspect = output<FeeScheduleModel>();

  protected readonly cols: TableColumn<FeeScheduleModel>[] = [
    { field: 'name', header: 'Nombre' },
    { field: 'description', header: 'Descripcion' },
    { field: 'startDate', header: 'Fecha' },
    { field: 'amount', header: 'Monto' },
  ];

  search(event: TableLazyLoadEvent): void {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
    };

    this.filter.emit(searchParams);
  }
}
