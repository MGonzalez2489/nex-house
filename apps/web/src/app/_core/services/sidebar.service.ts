import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SessionService } from './session.service';
import { SIDEBAR_CONFIG } from '@core/configs';
import { NavItemModel } from '@core/layout/sidebar/nav.model';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  readonly filteredConfig = computed(() => {
    const role = this.sessionService.user()?.role || 'unknown';
    const fullConfig = SIDEBAR_CONFIG;

    return {
      ...fullConfig,
      sections: fullConfig.sections
        .map((section) => ({
          ...section,
          items: this.filterItems(section.items, role),
        }))
        .filter((section) => section.items.length > 0),
    };
  });

  // Collapsed state
  readonly collapsed = signal(false);

  // Currently active nav item id
  readonly activeId = signal('dashboard');

  // Set of open submenu ids
  private readonly _openMenus = signal<Set<string>>(new Set());
  readonly openMenus = computed(() => this._openMenus());

  constructor() {
    this.syncWithRoute();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncWithRoute();
      });
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  setActive(id: string): void {
    this.activeId.set(id);
  }

  isActive(id: string): boolean {
    return this.activeId() === id;
  }

  isOpen(id: string): boolean {
    return this._openMenus().has(id);
  }

  toggleMenu(id: string): void {
    this._openMenus.update((set) => {
      const next = new Set(set);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  openMenuForRoute(id: string): void {
    this._openMenus.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }
  private syncWithRoute(): void {
    // 1. Obtenemos la ruta limpia (sin query params)
    const currentRoute = this.router.url.split('?')[0];

    // 2. Buscamos el ID activo
    // Si tu ruta es /finance/charges, el activeId será 'charges'
    const segments = currentRoute.split('/').filter((s) => s !== '');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
      this.activeId.set(lastSegment);

      // 3. Lógica de Auto-Apertura:
      // Si tenemos más de un segmento, el anterior suele ser el padre (ej: 'finance')
      if (segments.length > 1) {
        // Abrimos todos los niveles superiores para que el item activo sea visible
        for (let i = 0; i < segments.length - 1; i++) {
          this.openMenuForRoute(segments[i]);
        }
      }
    }
  }

  private filterItems(items: NavItemModel[], role: string): NavItemModel[] {
    return items
      .filter((item) => !item.roles || item.roles.includes(role as any))
      .map((item) => ({
        ...item,
        children: item.children
          ? this.filterItems(item.children, role)
          : undefined,
      }));
  }
}
