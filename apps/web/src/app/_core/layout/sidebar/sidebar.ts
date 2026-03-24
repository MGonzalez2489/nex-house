import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserModel } from '@nex-house/models';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  user = input<UserModel>();
  menuItems = signal([
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-bar' },
    { label: 'Neighborhoods', path: '/neighborhoods', icon: 'pi pi-map' },
    { label: 'Housing Units', path: '/units', icon: 'pi pi-home' },
    // { label: 'Users', path: '/users', icon: 'pi pi-users' },
  ]);
}
