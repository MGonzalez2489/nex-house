import { Component, effect, input, output, signal } from '@angular/core';
import { DASHBOARD_ROUTES_ENUM } from '@features/dashboard';
import { NEIGHBORHOODS_ROUTES_ENUM } from '@features/neighborhoods';
import { USERS_ROUTES_ENUM } from '@features/users';
import { UserRoleEnum } from '@nex-house/enums';
import { UserModel } from '@nex-house/models';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar',
  imports: [PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  user = input<UserModel>();
  logout = output();
  navigate = output();
  menuItems = signal<MenuItem[]>([]);

  constructor() {
    effect(() => {
      const cUser = this.user();
      if (!cUser) return;

      const menuItems =
        cUser.role === UserRoleEnum.SUPER_ADMIN
          ? this.createRootUserMenu()
          : cUser.role === UserRoleEnum.ADMIN
            ? this.createAdminUserMenu()
            : [];

      this.menuItems.set(menuItems);
    });
  }

  footerItems = signal([
    { label: 'Centro de Ayuda', path: '', icon: 'pi pi-question-circle' },
    {
      label: 'Cerrar Sesion',
      icon: 'pi pi-sign-out',
      routerLinkActiveOptions: {
        exact: true,
      },
      command: (): void => this.logout.emit(),
    },
  ]);

  private createRootUserMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        routerLink: `/${DASHBOARD_ROUTES_ENUM.HOME}`,
        routerLinkActiveOptions: {
          exact: true,
        },
        icon: 'pi pi-chart-bar',
        command: (): void => this.navigate.emit(),
      },
      {
        label: 'Areas Residenciales',
        routerLink: NEIGHBORHOODS_ROUTES_ENUM.HOME,
        routerLinkActiveOptions: {
          exact: true,
        },
        icon: 'pi pi-building',
        command: (): void => this.navigate.emit(),
      },
    ];
  }
  private createAdminUserMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        routerLink: `/${DASHBOARD_ROUTES_ENUM.HOME}`,
        icon: 'pi pi-chart-bar',
        command: (): void => this.navigate.emit(),
      },
      {
        label: 'Usuarios',
        routerLink: USERS_ROUTES_ENUM.HOME,
        icon: 'pi pi-users',
        routerLinkActiveOptions: {
          exact: true,
        },
        command: (): void => this.navigate.emit(),
      },
    ];
  }
}
