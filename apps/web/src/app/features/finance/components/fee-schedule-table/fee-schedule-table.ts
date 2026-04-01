import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FeeScheduleStatusEnum } from '@nex-house/enums';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { FeeScheduleModel } from '@nex-house/models';
import { Table, TableColumn } from '@shared/components/data';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-fee-schedule-table',
  imports: [Table, ButtonModule, DatePipe, CurrencyPipe, TagModule],
  templateUrl: './fee-schedule-table.html',
  styleUrl: './fee-schedule-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeScheduleTable {
  readonly data = input.required<FeeScheduleModel[]>();
  readonly isLoading = input.required<boolean>();
  readonly pagination = input<ApiPaginationMeta>();

  formatedData = computed(() =>
    this.data().map((fee) => ({
      ...fee,
      statusLabel: this.getStatusLabel(fee.status),
      statusSeverity: this.getStatusSeverity(fee.status),
    })),
  );

  filter = output<Search>();
  inspect = output<FeeScheduleModel>();

  protected readonly cols: TableColumn<FeeScheduleModel>[] = [
    { field: 'name', header: 'Concepto y tipo' },
    { field: 'description', header: 'Programación' },
    { field: 'amount', header: 'Monto' },
    { field: 'status', header: 'Estado' },
    { field: 'startDate', header: 'Vigencia' },
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

  protected getStatusSeverity(status: string) {
    if (status === FeeScheduleStatusEnum.ACTIVE) return 'success';
    if (status === FeeScheduleStatusEnum.PAUSED) return 'secondary';
    if (status === FeeScheduleStatusEnum.CANCELLED) return 'danger';

    return 'warn';
  }

  protected getStatusLabel(status: string) {
    if (status === FeeScheduleStatusEnum.ACTIVE) return 'Activo';
    if (status === FeeScheduleStatusEnum.PAUSED) return 'Pausado';
    if (status === FeeScheduleStatusEnum.CANCELLED) return 'Cancelado';

    return 'Pendiente';
  }
}
