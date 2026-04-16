import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService, SidebarService } from '@core/services';
import { UserAvatar } from '@shared/components/ui';
import { RolePipe } from '@shared/pipes';
import { ButtonModule } from 'primeng/button';
import { NavItem } from './nav-item/nav-item';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, NavItem, ButtonModule, UserAvatar, RolePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  // protected readonly config = signal<SidebarConfigModel>(SIDEBAR_CONFIG);
  protected readonly service = inject(SidebarService);
  protected readonly sessionService = inject(SessionService);
  protected readonly user = this.sessionService.user;
  protected readonly config = computed(() => this.service.filteredConfig());
}
