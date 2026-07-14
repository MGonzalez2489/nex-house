import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { SideItem } from "../sidebar-item/side-item";
import { SidebarItem } from "../sidebar-item/sidebar-item";

@Component({
  selector: "app-sidebar",
  imports: [SidebarItem],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Sidebar {
  items = input.required<SideItem[]>();
}
