import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NeighborhoodModel, UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { UserAvatar } from '@shared/components/ui';
import { RolePipe } from '@shared/pipes';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenuModule, UserAvatar, RolePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  user = input<UserModel>();
  neighborhood = input<NeighborhoodModel>();
  toggleSidebar = output();
  logout = output();
}
