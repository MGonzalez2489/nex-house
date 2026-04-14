import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '@core/services';
import { NavSubmenu } from '../nav-submenu/nav-submenu';
import { NavItemModel } from '../nav.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-nav-item',
  imports: [
    RouterLink,
    RouterLinkActive,
    NavSubmenu,
    NgTemplateOutlet,
    ButtonModule,
  ],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItem {
  readonly item = input.required<NavItemModel>();

  protected readonly sidebarService = inject(SidebarService);

  protected isActive(): boolean {
    const id = this.item().id;
    const children = this.item()?.children;
    if (children && children.length > 0) {
      return children.some((c) => this.sidebarService.isActive(c.id));
    }
    return this.sidebarService.isActive(id);
  }

  protected isOpen(): boolean {
    return this.sidebarService.isOpen(this.item().id);
  }

  protected toggle(): void {
    this.sidebarService.toggleMenu(this.item().id);
  }

  protected activate(): void {
    this.sidebarService.setActive(this.item().id);
  }
}
