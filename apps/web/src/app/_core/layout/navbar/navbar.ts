import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";

import { SessionService, SidebarService } from "@core/services";
import { UserAvatar } from "@shared/components/ui";
import { RolePipe } from "@shared/pipes";
import { Brand } from "../brand/brand";
import { UserRoleEnum } from "@nex-house/enums";
import { MenuItem } from "primeng/api";

@Component({
  selector: "app-navbar",
  imports: [ButtonModule, MenuModule, UserAvatar, RolePipe, Brand],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  protected readonly sessionService = inject(SessionService);
  private readonly sidebarService = inject(SidebarService);
  protected readonly config = computed(
    () => this.sidebarService.filteredConfig()?.sections,
  );
  protected readonly residentMenu = signal<MenuItem[]>([
    {
      label: "Perfil",
      icon: "pi pi-user",
    },
    { separator: true },
    {
      label: "Configuracion",
      icon: "pi pi-cog",
    },
    {
      label: "Ayuda",
      icon: "pi pi-question-circle",
    },
    { separator: true },

    {
      label: "Cerrar Sesion",
      icon: "pi pi-sign-out",
    },
  ]);

  toggleSidebar = output();
  logout = output();

  expirationCounter = signal<string | null>(null);
  isResident = computed(
    () => this.sessionService.user()?.role === UserRoleEnum.RESIDENT,
  );

  constructor() {
    effect(() => {
      const c = this.config();
      if (!c) return;

      console.log("config", c);
    });
    effect((onCleanup) => {
      let timerId: number | undefined;
      const cExp = this.sessionService.expTime();

      if (!cExp) {
        this.expirationCounter.set(null);
        return;
      }

      const expirationTimeInMS = cExp * 1000;

      const updateDisplay = () => {
        const now = Date.now();
        const remainingMs = expirationTimeInMS - now;

        if (remainingMs <= 0) {
          this.expirationCounter.set("Expired");
          if (timerId !== undefined) {
            clearInterval(timerId);
            timerId = undefined;
          }
          return;
        }

        const totalSeconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        this.expirationCounter.set(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      };

      updateDisplay();

      timerId = setInterval(updateDisplay, 1000);

      onCleanup(() => {
        if (timerId !== undefined) {
          clearInterval(timerId);
        }
      });
    });
  }
}
