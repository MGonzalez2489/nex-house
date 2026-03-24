import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_ROUTES_ENUM, AuthStore } from '@features/auth';
import { UserRoleEnum } from '@nex-house/enums';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private authStore = inject(AuthStore);
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

  logout() {
    this.authStore.logout();
    this.router.navigateByUrl(AUTH_ROUTES_ENUM.LOGIN);
  }
  //
  navigateTo() {
    console.log('navigate');
  }
}
