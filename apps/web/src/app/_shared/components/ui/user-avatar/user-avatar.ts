import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserModel } from '@nex-house/models';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user-avatar',
  imports: [AvatarModule],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatar {
  private readonly palette = [
    '#ece9fc',
    '#dee9fc',
    '#dff7e9',
    '#fcf1e3',
    '#fce4ec',
    '#e0f7fa',
    '#f3e5f5',
    '#fff9c4',
    '#efebe9',
    '#f1f8e9',
  ];

  user = input.required<UserModel>();

  avatar = computed(() => {
    const cUser = this.user();
    if (!cUser) return;

    let r = '';

    if (cUser.firstName) {
      r += cUser.firstName[0];
    }
    if (cUser.lastName) {
      r += cUser.lastName[0];
    }

    return r.toUpperCase();
  });

  bgColor = computed(() => {
    const text = this.user().fullName;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.palette.length;
    return this.palette[index];
  });
}
