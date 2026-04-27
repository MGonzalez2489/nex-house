import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BREADCRUMB_MAP } from '@core/configs/breadcrumb.config';
import { filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumbs());

    this.updateBreadcrumbs(); // Carga inicial
  }

  private updateBreadcrumbs() {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter((s) => s !== '');

    const crumbs: Breadcrumb[] = [];
    let currentPath = '';

    segments.forEach((segment) => {
      currentPath += `/${segment}`;

      // Si el segmento es un UUID/ID, podrías manejarlo aquí.
      // Por ahora, usamos el mapa o el nombre tal cual.
      // const label = BREADCRUMB_MAP[segment] || segment;
      //
      // crumbs.push({ label, url: currentPath });
      let label = BREADCRUMB_MAP[segment];

      if (!label) {
        // Si el segmento es un UUID o un número largo, es un ID
        const isId = /^[0-9a-fA-F-]+$/.test(segment) || !isNaN(Number(segment));
        label = isId ? 'Detalles' : segment;
      }

      crumbs.push({ label, url: currentPath });
    });

    this.breadcrumbs.set(crumbs);
  }
}
