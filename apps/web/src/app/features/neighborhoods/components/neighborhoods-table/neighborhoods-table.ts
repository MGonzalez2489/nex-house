import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { NeighborhoodModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-neighborhoods-table',
  imports: [Card, TableModule, ButtonModule, InputTextModule],
  templateUrl: './neighborhoods-table.html',
  styleUrl: './neighborhoods-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsTable {
  data = input.required<NeighborhoodModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();

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
