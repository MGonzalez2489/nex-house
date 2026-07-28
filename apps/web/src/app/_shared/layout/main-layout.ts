import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Type,
} from "@angular/core";
import { SessionService } from "@core/services";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { AdminLayout } from "./admin";
import { ResidentLayout } from "./resident";
import { RootLayout } from "./root/root-layout/root-layout";

@Component({
  selector: "app-main-layout",
  imports: [NgComponentOutlet],
  templateUrl: "./main-layout.html",
  styleUrl: "./main-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly store = inject(SessionService);

  //
  protected activeLayout!: Type<any>;

  constructor() {
    const role = this.store.user()?.role;
    if (!role) return;

    switch (role.name) {
      case UserRoleEnum.SUPERADMIN:
        this.activeLayout = RootLayout;
        break;
      case UserRoleEnum.ADMIN:
        this.activeLayout = AdminLayout;
        break;
      default:
        this.activeLayout = ResidentLayout;
        break;
    }
  }
}
