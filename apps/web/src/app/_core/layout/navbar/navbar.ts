import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MenuModule, AvatarModule, AvatarGroupModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  user = input<UserModel>();
  toggleSidebar = output();
  logout = output();

  avatarLabel = computed(() => {
    const cUser = this.user();
    if (!cUser) return;

    let r = '';

    if (cUser.firstName) {
      r += cUser.firstName[0];
    }
    if (cUser.lastName) {
      r += cUser.lastName[0];
    }

    return r;
  });
}
