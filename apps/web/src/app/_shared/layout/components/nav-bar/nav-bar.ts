import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { SessionService } from "@core/services";
import { Button } from "primeng/button";

@Component({
  selector: "app-nav-bar",
  imports: [Button],
  templateUrl: "./nav-bar.html",
  styleUrl: "./nav-bar.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {
  protected readonly darkMode = signal<boolean>(
    typeof window !== "undefined"
      ? window.localStorage.getItem("theme") === "dark" ||
          (!("theme" in window.localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      : false,
  );

  protected readonly sessionService = inject(SessionService);

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

  toggleSidebar() {
    this.sessionService.toggleSession();
  }
}
