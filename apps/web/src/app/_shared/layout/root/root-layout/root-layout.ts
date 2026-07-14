import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavBar, Sidebar, SideItem } from "@shared/layout/components";

@Component({
  selector: "app-root-layout",
  imports: [NavBar, Sidebar, RouterOutlet],
  templateUrl: "./root-layout.html",
  styleUrl: "./root-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootLayout {
  menu = signal<SideItem[]>([
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
