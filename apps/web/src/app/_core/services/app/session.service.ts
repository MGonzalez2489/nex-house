import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoleEnum } from '@nex-house/enums';
import { AuthStore } from '@stores/auth.store';
import { AUTH_ROUTES_ENUM } from 'src/app/features/auth/auth.routes';

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
