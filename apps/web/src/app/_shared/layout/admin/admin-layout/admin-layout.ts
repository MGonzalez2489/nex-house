import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { SessionService } from "@core/services";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { ONBOARDING_ROUTES_ENUM } from "@onboarding/onboarding.routes";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { NavBar, Sidebar, SideItem } from "@shared/layout/components";
import { UNIT_ROUTES_ENUM } from "@units/units.routes";
import { DrawerModule } from "primeng/drawer";

@Component({
  selector: "app-admin-layout",
  imports: [NavBar, Sidebar, RouterOutlet, DrawerModule],
  templateUrl: "./admin-layout.html",
  styleUrl: "./admin-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  private readonly router = inject(Router);
  protected readonly sessionService = inject(SessionService);
  private readonly currentUrl = signal(this.router.url);

  showNavComponentes = computed(() => {
    const loggedData = this.sessionService.loggedInUserData();

    if (!loggedData) return false;

    const path = this.currentUrl();

    if (path.includes(ONBOARDING_ROUTES_ENUM.HOME)) return false;

    return loggedData.status.name === UserStatusEnum.ACTIVE;
  });

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }

  readonly menu = signal<SideItem[]>([
    {
      title: "",
      items: [
        {
          route: `/${DASHBOARD_ROUTES_ENUM.HOME}`,
          icon: "pi pi-home",
          title: "Dashboard",
        },
      ],
    },
    {
      title: "Administración",
      items: [
        {
          route: `/${RESIDENT_ROUTES_ENUM.HOME}`,
          icon: "pi pi-users",
          title: "Residentes",
        },
        {
          route: `/${UNIT_ROUTES_ENUM.HOME}`,
          icon: "pi pi-building",
          title: "Unidades",
        },
      ],
    },
  ]);
}
