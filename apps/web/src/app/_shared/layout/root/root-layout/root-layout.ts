import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SessionService } from "@core/services";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { NavBar, Sidebar, SideItem } from "@shared/layout/components";
import { DrawerModule } from "primeng/drawer";

@Component({
  selector: "app-root-layout",
  imports: [NavBar, Sidebar, RouterOutlet, DrawerModule],
  templateUrl: "./root-layout.html",
  styleUrl: "./root-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootLayout {
  private readonly neighStore = inject(NeighborhoodsStore);
  protected readonly sessionService = inject(SessionService);

  readonly menu = signal<SideItem[]>([
    {
      title: "Menú",
      items: [
        {
          route: "/dashboard",
          icon: "pi pi-home",
          title: "Dashboard",
        },
        {
          route: "/neighborhoods",
          icon: "pi pi-building",
          title: "Fraccionamientos",
        },
      ],
    },
  ]);
}
