import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserModel } from '@nex-house/models';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  user = input<UserModel>();
  logout = output();
  menuItems = signal([
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-bar' },
    {
      label: 'Areas Residenciales',
      path: '/neighborhoods',
      icon: 'pi pi-building',
    },
    // { label: 'Housing Units', path: '/units', icon: 'pi pi-home' },
    // { label: 'Users', path: '/users', icon: 'pi pi-users' },
  ]);

  footerItems = signal([
    { label: 'Centro de Ayuda', path: '', icon: 'pi pi-question-circle' },
    {
      label: 'Cerrar Sesion',
      icon: 'pi pi-sign-out',
      command: (): void => this.logout.emit(),
    },
  ]);
}
