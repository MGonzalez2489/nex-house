import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from '@core/services';
import { UsersTable } from '@features/users/components/users-table/users-table';
import { Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { UsersStore } from '@features/users/users.store';
import { ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-users-home-page',
  imports: [UsersTable, ConfirmDialogModule, CardModule],
  templateUrl: './users-home-page.html',
  styleUrl: './users-home-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class UsersHomePage {
  protected readonly store = inject(UsersStore);
  protected readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  addUser() {
    this.router.navigate(['new'], {
      relativeTo: this.route,
    });
  }
  updateUser(user: UserModel) {
    this.router.navigate([user.publicId, 'update'], {
      relativeTo: this.route,
    });
  }
  removeUser(user: UserModel) {
    this.confirmationService.confirm({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${user.fullName}? Esta acción desactivará sus accesos a la unidad.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        await this.store.delete(user.publicId);
      },
    });
  }

  search(filters: Search): void {
    this.store.loadAll(filters);
  }
}
