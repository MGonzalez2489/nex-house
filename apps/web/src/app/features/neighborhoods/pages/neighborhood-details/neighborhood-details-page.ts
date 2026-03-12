import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PageHeader } from '@shared/components/ui';
import { ContextStore } from '@stores/context.store';
import { MenuItem } from 'primeng/api';
import { Card } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-neighborhood-details-page',
  imports: [PageHeader, TabsModule, Card, RouterOutlet, RouterLink],
  templateUrl: './neighborhood-details-page.html',
  styleUrl: './neighborhood-details-page.css',
})
export class NeighborhoodDetailsPage implements OnInit, OnDestroy {
  protected readonly store = inject(ContextStore);
  protected readonly id = input.required<string>();

  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;

  name = 'Quintas San Miguel';
  slug = 'quintas-san-miguel';

  ngOnInit(): void {
    const cId = this.id();
    this.store.setNeighborhoodId(cId);
    this.items = [
      {
        label: 'General',
        icon: 'pi pi-info-circle',
        routerLink: 'general',
      },
      {
        label: 'Casas (Unidades)',
        icon: 'pi pi-home',
        routerLink: 'units',
      },
      {
        label: 'Usuarios & Admins',
        icon: 'pi pi-users',
        routerLink: 'users',
      },
    ];

    this.activeItem = this.items.find((f) => f.routerLink === 'users');
  }

  ngOnDestroy(): void {
    this.store.setNeighborhoodId(null);
  }
}
