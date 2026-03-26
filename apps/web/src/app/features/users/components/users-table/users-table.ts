import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { UserAvatar } from '@shared/components/ui';
import { PhonePipe } from '@shared/pipes';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { RoleTag } from '../role-tag/role-tag';

import { Table, TableColumn } from '@shared/components/data';
import { BadgeModule } from 'primeng/badge';
import { UserStatusTag } from '../user-status-tag/user-status-tag';

@Component({
  selector: 'app-users-table',
  imports: [
    TableModule,
    ButtonModule,
    PhonePipe,
    UserAvatar,
    Table,
    RoleTag,
    UserStatusTag,
    InputTextModule,
    BadgeModule,
  ],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  users = input.required<UserModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();

  //outputs
  filter = output<Search>();
  inspect = output<UserModel>();

  search(event: TableLazyLoadEvent): void {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
    };

    this.filter.emit(searchParams);
  }

  cols: TableColumn<UserModel>[] = [
    { field: 'fullName', header: 'Habitante' },
    { field: 'email', header: 'Contacto' },
    { field: 'assignments', header: 'Unidad' },
    { field: 'role', header: 'Rol' },
    { field: 'status', header: 'Estatus' },
  ];
}
