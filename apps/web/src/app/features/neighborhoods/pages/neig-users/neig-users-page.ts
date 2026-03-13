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
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-neig-users-page',
  imports: [
    ButtonModule,
    TableModule,
    UsersTable,
    TableModule,
    AvatarModule,
    TagModule,
    BadgeModule,
    InputTextModule,
  ],
  templateUrl: './neig-users-page.html',
  styleUrl: './neig-users-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // this.store.loadAll(filters);
})
export class NeigUsersPage implements OnInit {
  ngOnInit(): void {
    this.search({ first: 0, rows: 10 });
  }
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
