import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { UserModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent } from "@shared/components";
import { SideItem } from "../sidebar-item/side-item";
import { SidebarItem } from "../sidebar-item/sidebar-item";
import { Button } from "primeng/button";

@Component({
  selector: "app-sidebar",
  imports: [SidebarItem, AvatarComponent, Button],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Sidebar {
  items = input.required<SideItem[]>();
  user = input.required<UserModel>();

  navigate = output();
  logout = output();

  protected readonly isUserMenuOpen = signal<boolean>(false);

  toggleUserMenu() {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }
  alert() {
    alert("hola");
  }
}
