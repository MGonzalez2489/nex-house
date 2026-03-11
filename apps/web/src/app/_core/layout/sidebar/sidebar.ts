import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuItems = signal([
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-bar' },
    { label: 'Neighborhoods', path: '/neighborhoods', icon: 'pi pi-map' },
    { label: 'Housing Units', path: '/units', icon: 'pi pi-home' },
    { label: 'Users', path: '/users', icon: 'pi pi-users' },
  ]);
}
