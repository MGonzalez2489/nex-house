import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { SessionService } from '@core/services';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Navbar, DrawerModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly sessionService = inject(SessionService);
  sidebarVisible = signal(false);
}
