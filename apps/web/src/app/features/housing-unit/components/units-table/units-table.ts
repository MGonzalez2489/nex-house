import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { UnitModel } from '@nex-house/models';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  Table,
  TableColumn,
} from '../../../../_shared/components/data/table/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserAvatarGroup } from '@shared/components/ui';

@Component({
  selector: 'app-units-table',
  imports: [Table, ButtonModule, InputTextModule, UserAvatarGroup],
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
    { field: 'assignations', header: 'Habitantes' },
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
