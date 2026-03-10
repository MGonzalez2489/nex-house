import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenuModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  toggleSidebar = output();
  fName = 'Pepe';
  role = 'Admin';
  // @Output() toggleSidebar = new EventEmitter<void>();
}
