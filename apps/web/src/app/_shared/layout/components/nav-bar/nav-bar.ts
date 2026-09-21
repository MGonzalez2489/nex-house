import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent, BrandComponent } from "@shared/components";
import { USER_ROUTES_ENUM } from "@user/user.routes";
import { ThemeService } from "@core/services";
import { MenuItem } from "@openng/optimus-ui/api";
import { Button } from "@openng/optimus-ui/button";
import { MenuModule } from "@openng/optimus-ui/menu";

/**
 * Barra superior común a todos los layouts autenticados.
 *
 * - Presentacional: recibe `user`/`profile` y emite `toggleSidebar`/`logout`.
 * - El tema claro/oscuro se delega en `ThemeService` (deja de vivir aquí).
 * - No contiene datos de mock: el menú de usuario y las notificaciones son
 *   el esqueleto a conectar con sus features reales.
 */
@Component({
  selector: "app-nav-bar",
  imports: [Button, BrandComponent, MenuModule, AvatarComponent],
  templateUrl: "./nav-bar.html",
  styleUrl: "./nav-bar.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {
  user = input.required<UserModel>();
  profile = input.required<UserProfileModel>();
  toggleSidebar = output();
  logout = output();

  protected readonly themeService = inject(ThemeService);

  protected readonly menuItems = signal<MenuItem[]>([
    {
      label: "Mi Perfil",
      icon: "pi pi-user",
      routerLink: `/${USER_ROUTES_ENUM.HOME}`,
    },
    { label: "Ayuda y soporte", icon: "pi pi-question-circle" },
    { separator: true },
    {
      label: "Cerrar sesión",
      icon: "pi pi-sign-out",
      command: () => {
        this.logout.emit();
      },
    },
  ]);

  isResident = computed(
    () => this.user()?.role?.name === UserRoleEnum.RESIDENT,
  );
}
