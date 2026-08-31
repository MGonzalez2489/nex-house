import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Type,
} from "@angular/core";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { AdminLayout } from "./admin";
import { ResidentLayout } from "./resident";
import { RootLayout } from "./root/root-layout/root-layout";
import { UserStore } from "@stores/user.store";

@Component({
  selector: "app-main-layout",
  imports: [NgComponentOutlet],
  templateUrl: "./main-layout.html",
  styleUrl: "./main-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly store = inject(UserStore);

  //
  protected activeLayout!: Type<any>;

  constructor() {
    effect(() => {
      const role = this.store.role();

      if (!role) return;

      switch (role.name) {
        case UserRoleEnum.SUPERADMIN:
          this.activeLayout = RootLayout;
          break;
        case UserRoleEnum.ADMIN:
          this.activeLayout = AdminLayout;
          break;
        default: {
          console.log(
            `======== LAYOUT UNDEFINED WITH ROLE: ${role?.displayName}`,
          );
          this.activeLayout = ResidentLayout;
          break;
        }
      }
    });
  }
}
