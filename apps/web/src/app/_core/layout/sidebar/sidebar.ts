import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService, SidebarService } from '@core/services';
import { UserAvatar } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { NavItem } from './nav-item/nav-item';
import { SidebarConfigModel } from './nav.model';
import { SIDEBAR_CONFIG } from '../../configs/sidebar.config';
import { RolePipe } from '@shared/pipes';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, NavItem, ButtonModule, UserAvatar, RolePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly config = signal<SidebarConfigModel>(SIDEBAR_CONFIG);
  protected readonly service = inject(SidebarService);
  protected readonly sessionService = inject(SessionService);
  protected readonly user = this.sessionService.user;
}
