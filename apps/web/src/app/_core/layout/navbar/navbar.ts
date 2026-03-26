import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
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

  exp = input<number>();

  expirationCounter = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      let timerId: number | undefined;
      const cExp = this.exp();

      if (!cExp) {
        this.expirationCounter.set(null);
        return;
      }

      const expirationTimeInMS = cExp * 1000;

      const updateDisplay = () => {
        const now = Date.now();
        const remainingMs = expirationTimeInMS - now;

        if (remainingMs <= 0) {
          this.expirationCounter.set('Expired');
          if (timerId !== undefined) {
            clearInterval(timerId);
            timerId = undefined;
          }
          return;
        }

        const totalSeconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        this.expirationCounter.set(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        );
      };

      updateDisplay();

      timerId = setInterval(updateDisplay, 1000);

      onCleanup(() => {
        if (timerId !== undefined) {
          clearInterval(timerId);
        }
      });
    });
  }
}
