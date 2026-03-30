import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TooltipModule } from 'primeng/tooltip';

interface AvatarItem {
  label: string;
  fullLabel: string;
  color: string;
}

@Component({
  selector: 'app-user-avatar-group',
  imports: [AvatarModule, AvatarGroupModule, TooltipModule],
  templateUrl: './user-avatar-group.html',
  styleUrl: './user-avatar-group.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarGroup {
  text() {
    throw new Error('Method not implemented.');
  }
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

  list = input<string[]>();

  avatars = computed<AvatarItem[]>(() => {
    const cList = this.list();

    if (!cList) return [];

    return cList.map((text) => {
      const result: AvatarItem = {
        label: 'N/A',
        fullLabel: 'N/A',
        color: this.palette[0],
      };

      if (!text || text === '') return result;

      result.fullLabel = text;

      let r = '';

      const textArray = text.split(' ');
      textArray.forEach((f) => (r += f[0]));

      result.label = r.toUpperCase();

      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.palette.length;
      result.color = this.palette[index];

      return result;
    });
  });
}
