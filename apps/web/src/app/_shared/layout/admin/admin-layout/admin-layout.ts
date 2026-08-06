import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
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
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
import { UNIT_ROUTES_ENUM } from "@units/units.routes";
import { UnitStore } from "@units/units.store";
import { DrawerModule } from "primeng/drawer";

@Component({
  selector: "app-admin-layout",
  imports: [NavBar, Sidebar, RouterOutlet, DrawerModule],
  templateUrl: "./admin-layout.html",
  styleUrl: "./admin-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout implements OnInit {
  private readonly router = inject(Router);
  protected readonly sessionService = inject(SessionService);
  protected readonly catStore = inject(CatalogsStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly unitStore = inject(UnitStore);

  private readonly currentUrl = signal(this.router.url);

  showNavComponentes = computed(() => {
    const cUser = this.sessionService.user();

    if (!cUser) return false;

    const path = this.currentUrl();

    if (path.includes(ONBOARDING_ROUTES_ENUM.HOME)) return false;

    return cUser.status?.name === UserStatusEnum.ACTIVE;
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

  ngOnInit(): void {
    //TODO: is required to move this?
    this.catStore.loadCatalogs();
    this.contextStore.loadNeighborhood();
    this.contextStore.loadStreets();
    this.unitStore.loadAll({ showAll: true });
  }
}
