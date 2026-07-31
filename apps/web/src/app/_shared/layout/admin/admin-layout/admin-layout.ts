import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SessionService } from "@core/services";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { NavBar, Sidebar, SideItem } from "@shared/layout/components";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
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
export class AdminLayout implements OnInit {
  protected readonly sessionService = inject(SessionService);
  protected readonly catStore = inject(CatalogsStore);
  protected readonly contextStore = inject(ContextStore);
  // protected readonly catStores = inject(CatalogsStore);

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
  }
}
