import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalService } from '@core/services';
import { Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { UsersTable } from '@shared/components/data';
import { UsersStore } from '@stores/users.store';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-neig-users-page',
  imports: [UsersTable, Card, ButtonModule, RouterLink],
  templateUrl: './neig-users-page.html',
  styleUrl: './neig-users-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeigUsersPage {
  protected readonly store = inject(UsersStore);
  protected readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  addUser() {
    this.router.navigate(['new']);
    // this.modalService.open(CreateUserForm, {
    //   header: 'Crear Usuario',
    //   width: '35vw',
    // });
  }
  updateUser(user: UserModel) {
    this.router.navigate([user.publicId, 'update'], {
      relativeTo: this.route,
    });
  }
  removeUser(user: UserModel) {
    alert(`Remove ${user.publicId} `);
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
