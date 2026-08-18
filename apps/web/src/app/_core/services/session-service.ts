import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { AUTH_ROUTES_ENUM } from "@auth/auth.routes";
import { AuthStore } from "@auth/store";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { ProfileStore } from "@stores/profile.store";
import { fromEvent, debounceTime, startWith } from "rxjs";

export type ViewSize = "small" | "medium" | "large";

const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

@Injectable({
  providedIn: "root",
})
export class SessionService {
  //injects
  private readonly profileStore = inject(ProfileStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly _viewSize: WritableSignal<ViewSize> = signal(
    this.getViewSize(window.innerWidth),
  );

  constructor() {
    fromEvent(window, "resize")
      .pipe(
        debounceTime(100), // Debounce to prevent excessive updates
        startWith(null), // Emit initial value
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._viewSize.set(this.getViewSize(window.innerWidth));
      });
  }

  //properties
  readonly user = computed(() => this.profileStore.user());
  readonly isUserActive = computed<boolean>(() => {
    const cUser = this.user();
    if (!cUser) return false;

    if (cUser.status?.name !== UserStatusEnum.ACTIVE) return false;

    return true;
  });
  readonly isMobile = computed(() => this._viewSize() === "small");
  readonly isTablet = computed(() => this._viewSize() === "medium");
  readonly isDesktop = computed(() => this._viewSize() === "large");

  readonly isSidebarOpen = signal<boolean>(false);

  toggleSession(value?: boolean): void {
    if (value) {
      const cValue = this.isSidebarOpen();
      if (cValue !== value) {
        this.isSidebarOpen.set(value);
      }
    } else {
      this.isSidebarOpen.set(!this.isSidebarOpen());
    }
  }
  async logout() {
    await this.authStore.logout();
    this.router.navigateByUrl(`/${AUTH_ROUTES_ENUM.LOGIN}`);
  }
  private getViewSize(width: number): ViewSize {
    if (width < TAILWIND_BREAKPOINTS.md) {
      return "small";
    } else if (
      width >= TAILWIND_BREAKPOINTS.md &&
      width < TAILWIND_BREAKPOINTS.lg
    ) {
      return "medium";
    } else {
      return "large";
    }
  }
}
