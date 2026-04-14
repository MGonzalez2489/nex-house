import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItemModel } from '../nav.model';
import { SidebarService } from '@core/services';

@Component({
  selector: 'app-nav-submenu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-submenu.html',
  styleUrl: './nav-submenu.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavSubmenu {
  readonly items = input.required<NavItemModel[]>();
  readonly open = input(false);

  protected readonly sidebarService = inject(SidebarService);

  protected activate(id: string): void {
    this.sidebarService.setActive(id);
  }
}
