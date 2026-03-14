import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
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

  // user = input.required<UserModel>();
  text = input<string>();

  avatar = computed(() => {
    const text = this.text() || '';
    if (!text || text === '') return 'N/A';

    let r = '';

    const textArray = text.split(' ');
    textArray.forEach((f) => (r += f[0]));

    return r.toUpperCase();
  });

  bgColor = computed(() => {
    let text = this.text();
    if (!text || text === '') text = 'N/A';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.palette.length;
    return this.palette[index];
  });
}
