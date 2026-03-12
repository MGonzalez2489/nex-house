import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-users-table',
  imports: [TableModule, ButtonModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  users = input.required<UserModel[]>();
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
