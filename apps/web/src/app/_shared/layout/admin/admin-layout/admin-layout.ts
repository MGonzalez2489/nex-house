import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SessionService } from "@core/services";
import { NavBar, Sidebar, SideItem } from "@shared/layout/components";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
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
          route: "/dashboard",
          icon: "pi pi-home",
          title: "Dashboard",
        },
      ],
    },
    {
      title: "Administración",
      items: [
        {
          route: "/neighborhoods",
          icon: "pi pi-users",
          title: "Residentes",
        },
        {
          route: "/neighborhoods",
          icon: "pi pi-building",
          title: "Unidades",
          isDisabled: true,
        },
      ],
    },
  ]);

  ngOnInit(): void {
    //TODO: is required to move this?
    this.catStore.loadCatalogs();
    this.contextStore.loadNeighborhood();
  }
}
