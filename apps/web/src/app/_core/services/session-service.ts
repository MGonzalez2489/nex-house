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
import {
  UserModel,
  UserProfileModel,
  UserRoleModel,
  UserStatusModel,
} from "@nexhouse/shared-domain/models";
import { UserStore } from "@stores/user.store";
import { debounceTime, fromEvent, startWith } from "rxjs";

export type ViewSize = "small" | "medium" | "large";

const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

interface LoggedInUserData {
  user: UserModel;
  profile: UserProfileModel;
  role: UserRoleModel;
  status: UserStatusModel;
}

@Injectable({
  providedIn: "root",
})
export class SessionService {
  //injects
  private readonly profileStore = inject(UserStore);
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

  readonly loggedInUserData = computed<LoggedInUserData | undefined>(() => {
    const user = this.profileStore.user();
    const profile = this.profileStore.profile();
    const role = this.profileStore.role();
    const status = this.profileStore.status();

    if (user && profile && role && status) {
      return { user, profile, role, status };
    }
    return undefined;
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
