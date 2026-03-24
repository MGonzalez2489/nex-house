import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UNITS_ROUTES_ENUM } from '@features/housing-unit';
import { NEIGHBORHOODS_ROUTES_ENUM } from '@features/neighborhoods';
import { USERS_ROUTES_ENUM } from '@features/users';
import { ContextStore } from '@stores/context.store';
import { MenuItem } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-neighborhood-details-page',
  imports: [TabsModule, RouterOutlet, RouterLink],
  templateUrl: './neighborhood-details-page.html',
  styleUrl: './neighborhood-details-page.css',
})
export class NeighborhoodDetailsPage implements OnInit, OnDestroy {
  protected readonly store = inject(ContextStore);
  protected readonly id = input.required<string>();

  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;

  ngOnInit(): void {
    const cId = this.id();
    this.store.setNeighborhoodId(cId);
    this.items = [
      {
        label: 'General',
        icon: 'pi pi-info-circle',
        routerLink: NEIGHBORHOODS_ROUTES_ENUM.OVERVIEW,
      },
      {
        label: 'Casas (Unidades)',
        icon: 'pi pi-home',
        routerLink: UNITS_ROUTES_ENUM.HOME,
      },
      {
        label: 'Usuarios & Admins',
        icon: 'pi pi-users',
        routerLink: `${USERS_ROUTES_ENUM.HOME}`,
      },
    ];

    this.activeItem = this.items.find((f) => f.routerLink === 'users');
  }

  ngOnDestroy(): void {
    this.store.setNeighborhoodId(null);
  }
}
