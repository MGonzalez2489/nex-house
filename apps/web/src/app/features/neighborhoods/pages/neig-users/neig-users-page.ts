import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ModalService } from '@core/services';
import { Search } from '@nex-house/interfaces';
import { UsersTable } from '@shared/components/data';
import { UserForm } from '@shared/components/forms';
import { UsersStore } from '@stores/users.store';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-neig-users-page',
  imports: [ButtonModule, TableModule, UsersTable],
  templateUrl: './neig-users-page.html',
  styleUrl: './neig-users-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // this.store.loadAll(filters);
})
export class NeigUsersPage implements OnInit {
  protected readonly store = inject(UsersStore);
  protected readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.addUser();
  }

  addUser() {
    this.modalService.open(UserForm, {
      header: 'Crear Usuario',
      width: '35vw',
    });
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
