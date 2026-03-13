import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { UserAvatar } from '@shared/components/ui';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenuModule, UserAvatar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  user = input<UserModel>();
  toggleSidebar = output();
  logout = output();
}
