import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { UnitModel } from '@nex-house/models';
import { TableLazyLoadEvent } from 'primeng/table';
import { Table, TableColumn } from '../table/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-units-table',
  imports: [Table, ButtonModule, InputTextModule],
  templateUrl: './units-table.html',
  styleUrl: './units-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsTable {
  units = input.required<UnitModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();
  cols: TableColumn<UnitModel>[] = [
    {
      field: 'identifier',
      header: 'Propiedad',
    },
    { field: 'street', header: 'Calle' },
  ];
  filter = output<Search>();

  search(event: TableLazyLoadEvent): void {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? '',
    };

    this.filter.emit(searchParams);
  }
}
