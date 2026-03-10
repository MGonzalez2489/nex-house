import { Component, input, output } from '@angular/core';
import { UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenuModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  user = input<UserModel>();
  toggleSidebar = output();
  logout = output();
}
