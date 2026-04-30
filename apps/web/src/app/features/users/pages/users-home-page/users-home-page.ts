import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFilters, UsersList } from '@features/users/components';
import { UsersTable } from '@features/users/components/users-table/users-table';
import { USERS_ROUTES_ENUM } from '@features/users/users.routes';
import { UsersStore } from '@features/users/users.store';
import { SearchUser } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { PageHeader } from '@shared/components/ui';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-users-home-page',
  imports: [
    CardModule,
    PageHeader,
    UsersFilters,
    UsersTable,
    UsersList,
    ButtonModule,
  ],
  templateUrl: './users-home-page.html',
  styleUrl: './users-home-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class UsersHomePage {
  protected readonly store = inject(UsersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  addUser() {
    this.router.navigate([USERS_ROUTES_ENUM.NEW], {
      relativeTo: this.route,
    });
  }
  // updateUser(user: UserModel) {
  //   this.router.navigate([user.publicId, 'update'], {
  //     relativeTo: this.route,
  //   });
  // }
  // removeUser(user: UserModel) {
  //   this.confirmationService.confirm({
  //     header: 'Confirmar Eliminación',
  //     message: `¿Estás seguro de que deseas eliminar a ${user.fullName}? Esta acción desactivará sus accesos a la unidad.`,
  //     icon: 'pi pi-exclamation-triangle',
  //     acceptLabel: 'Eliminar',
  //     rejectLabel: 'Cancelar',
  //     acceptButtonStyleClass: 'p-button-danger',
  //     rejectButtonStyleClass: 'p-button-text',
  //     accept: async () => {
  //       await this.store.delete(user.publicId);
  //     },
  //   });
  // }
  inspect(user: UserModel) {
    this.router.navigate([user.publicId], {
      relativeTo: this.route,
    });
  }

  search(filters: SearchUser): void {
    this.store.loadAll(filters);
  }
}
