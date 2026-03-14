import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from '@core/services';
import { Search } from '@nex-house/interfaces';
import { UsersTable } from '@shared/components/data';
import { UserForm } from '@shared/components/forms';
import { UsersStore } from '@stores/users.store';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-neig-users-page',
  imports: [ButtonModule, UsersTable, BadgeModule, InputTextModule],
  templateUrl: './neig-users-page.html',
  styleUrl: './neig-users-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeigUsersPage {
  protected readonly store = inject(UsersStore);
  protected readonly modalService = inject(ModalService);

  addUser() {
    this.modalService.open(UserForm, {
      header: 'Crear Usuario',
      width: '35vw',
    });
  }
  updateUser() {
    this.modalService.open(UserForm, {
      header: 'Actualizar Usuario',
      width: '35vw',
    });
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
