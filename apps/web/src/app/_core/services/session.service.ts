import { Injectable, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_ROUTES_ENUM, AuthStore } from '@features/auth';
import { UserRoleEnum } from '@nex-house/enums';
import { ContextStore } from '@stores/context.store';
import { BreadcrumbService } from './breadcrumb.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  //////////////////////stores
  private readonly authStore = inject(AuthStore);
  private readonly contextStore = inject(ContextStore);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private router = inject(Router);

  readonly user = computed(() => this.authStore.user());
  readonly token = computed(() => this.authStore.token());

  readonly isRoot = computed(
    () => this.user()?.role === UserRoleEnum.SUPER_ADMIN,
  );
  readonly isAdmin = computed(() => this.user()?.role === UserRoleEnum.ADMIN);
  readonly isResident = computed(
    () => this.user()?.role === UserRoleEnum.RESIDENT,
  );

  constructor() {
    effect(() => {
      const cUser = this.user();
      const cSelContext = this.contextStore.selectedId();
      if (cUser && cUser.neighborhoodId && !cSelContext) {
        this.contextStore.setNeighborhoodId(cUser.neighborhoodId);
      }
    });
  }

  logout() {
    this.authStore.logout();
    this.contextStore.resetState();
    this.router.navigateByUrl(AUTH_ROUTES_ENUM.LOGIN);
  }
  //
  goBack() {
    const crumbs = this.breadcrumbService.breadcrumbs();
    if (crumbs.length > 1) {
      const parentRoute = crumbs[crumbs.length - 2].url;
      this.router.navigateByUrl(parentRoute);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
