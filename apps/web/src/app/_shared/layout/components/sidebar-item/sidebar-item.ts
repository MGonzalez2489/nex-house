import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SideItem } from "./side-item";

@Component({
  selector: "app-sidebar-item",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./sidebar-item.html",
  styleUrl: "./sidebar-item.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SidebarItem {
  item = input.required<SideItem>();

  navigate = output();
}
