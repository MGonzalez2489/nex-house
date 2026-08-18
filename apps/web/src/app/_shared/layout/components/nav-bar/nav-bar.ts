import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { UserModel } from "@nexhouse/shared-domain/models";
import { PROFILE_ROUTES_ENUM } from "@profile/profile.routes";
import { AvatarComponent, BrandComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { Button } from "primeng/button";
import { MenuModule } from "primeng/menu";

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
  toggleSidebar = output();
  logout = output();

  protected readonly darkMode = signal<boolean>(
    //light mode by default
    typeof window !== "undefined"
      ? window.localStorage.getItem("theme") === "dark"
      : false,
    //system preference
    // typeof window !== "undefined"
    //   ? window.localStorage.getItem("theme") === "dark" ||
    //       (!("theme" in window.localStorage) &&
    //         window.matchMedia("(prefers-color-scheme: dark)").matches)
    //   : false,
  );
  protected readonly menuItems = signal<MenuItem[]>([
    {
      label: "Mi Perfil",
      icon: "pi pi-user",
      routerLink: `/${PROFILE_ROUTES_ENUM.HOME}`,
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

  // protected readonly sessionService = inject(SessionService);

  isResident = computed(
    () => this.user()?.role?.name === UserRoleEnum.RESIDENT,
  );

  constructor() {
    effect(() => {
      if (typeof window !== "undefined") {
        const isDark = this.darkMode();
        document.documentElement.classList.toggle("dark", isDark);
        window.localStorage.setItem("theme", isDark ? "dark" : "light");
      }
    });
  }

  toggleTheme() {
    this.darkMode.update((dark) => !dark);
  }

  // toggleSidebar() {
  //   this.sessionService.toggleSession();
  // }
}
