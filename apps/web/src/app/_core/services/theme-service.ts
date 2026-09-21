import { Injectable, effect, signal } from "@angular/core";

export type ThemeName = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

/**
 * Centraliza la gestión del tema claro/oscuro.
 *
 * - Expone la preferencia como un `signal` reactivo.
 * - La persiste en `localStorage` y la aplica como clase `dark` en
 *   `<html>`, de modo que un único toggle sirve a toda la app (antes esta
 *   lógica estaba duplicada en nav-bar y en el sidebar.
 *
 * Consumo: `private readonly themeService = inject(ThemeService);`
 * `this.themeService.theme()` y `this.themeService.toggle()`.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly theme = signal<ThemeName>(this.storedTheme());

  constructor() {
    effect(() => {
      const current = this.theme();
      document.documentElement.classList.toggle("dark", current === "dark");
      window.localStorage?.setItem(THEME_STORAGE_KEY, current);
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === "dark" ? "light" : "dark"));
  }

  private storedTheme(): ThemeName {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  }
}
