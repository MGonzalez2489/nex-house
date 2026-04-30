import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserRoleEnum, UserStatusEnum } from '@nex-house/enums';
import { KeyValueItem, SearchUser } from '@nex-house/interfaces';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

interface ISearchUser {
  globalFilter: FormControl<string>;
  role: FormControl<string>;
  status: FormControl<string>;
}

@Component({
  selector: 'app-users-filters',
  imports: [InputTextModule, SelectModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './users-filters.html',
  styleUrl: './users-filters.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFilters {
  filter = output<Partial<SearchUser>>();
  roles = signal<KeyValueItem[]>([
    { key: 'Todos los roles', value: '' },
    { key: 'Administrador', value: UserRoleEnum.ADMIN.toString() },
    { key: 'Residente', value: UserRoleEnum.RESIDENT.toString() },
  ]);
  status = signal<KeyValueItem[]>([
    { key: 'Todos los estatus', value: '' },
    { key: 'Activo', value: UserStatusEnum.ACTIVE },
    { key: 'Inactivo', value: UserStatusEnum.INACTIVE.toString() },
    { key: 'Pendiente', value: UserStatusEnum.PENDING_COMPLETION.toString() },
  ]);

  form = new FormGroup<ISearchUser>({
    globalFilter: new FormControl('', {
      nonNullable: true,
    }),
    role: new FormControl('', { nonNullable: true }),
    status: new FormControl('', {
      nonNullable: true,
    }),
  });

  search() {
    this.filter.emit(this.form.value);
  }
}
