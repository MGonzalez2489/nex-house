import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from "@angular/core";
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
  darkMode = signal<boolean>(
    typeof window !== "undefined"
      ? window.localStorage.getItem("theme") === "dark" ||
          (!("theme" in window.localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      : false,
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

  // isDarkMode = signal(true);

  // darkMode() {
  //   const element = document.querySelector("html");
  //   element?.classList.toggle("dark");
  //   this.isDarkMode.set(!this.isDarkMode());
  // }
}
