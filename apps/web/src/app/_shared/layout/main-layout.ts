import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Type,
} from "@angular/core";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { AdminLayout } from "./admin";
import { ResidentLayout } from "./resident";
import { RootLayout } from "./root/root-layout/root-layout";
import { UserStore } from "@user/user.store";

type AppLayout = Type<RootLayout | AdminLayout | ResidentLayout>;

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

  protected readonly activeLayout = computed<AppLayout | null>(() => {
    const role = this.store.role();

    if (!role) return null;

    switch (role.name) {
      case UserRoleEnum.SUPERADMIN:
        return RootLayout;
      case UserRoleEnum.ADMIN:
        return AdminLayout;
      default: {
        console.log(
          `======== LAYOUT UNDEFINED WITH ROLE: ${role?.displayName}`,
        );
        return ResidentLayout;
      }
    }
  });
}