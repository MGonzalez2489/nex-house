/* eslint-disable prefer-const */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { Avatar } from "primeng/avatar";

@Component({
  selector: "app-avatar-component",
  imports: [Avatar],
  templateUrl: "./avatar-component.html",
  styleUrl: "./avatar-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  private readonly palette = [
    "#ece9fc",
    "#dee9fc",
    "#dff7e9",
    "#fcf1e3",
    "#fce4ec",
    "#e0f7fa",
    "#f3e5f5",
    "#fff9c4",
    "#efebe9",
    "#f1f8e9",
  ];

  text = input<string>();
  url = input<string>();

  size = input<"normal" | "large" | "xlarge" | undefined>("normal");

  shape = input<"square" | "circle" | undefined>("circle");
  avatar = computed(() => {
    const text = this.text() || "";
    if (!text || text === "") return "N/A";

    let r = "";

    const textArray = text.split(" ");
    textArray.forEach((f) => (r.length < 2 ? (r += f[0]) : r));

    return r.toUpperCase();
  });
  bgColor = computed(() => {
    let text = this.text();
    if (!text || text === "") text = "N/A";
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.palette.length;
    return this.palette[index];
  });

  color = computed(() => {
    const backgroundColor = this.bgColor();
    return this.getStrongerColor(backgroundColor, 25, 25);
  });

  private getStrongerColor(
    hex: string,
    lightnessReduction: number,
    saturationIncrease: number,
  ): string {
    let [s, l] = this.hexToHsl(hex);
    const [h] = this.hexToHsl(hex);

    // Reducir la luminosidad para que sea más oscuro, sin bajar de 0
    l = Math.max(0, l - lightnessReduction);
    // Aumentar la saturación para que sea más vibrante, sin exceder 100
    s = Math.min(100, s + saturationIncrease);

    return this.hslToHex(h, s, l);
  }

  // Función utilitaria para convertir HEX a HSL
  private hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Función utilitaria para convertir HSL a HEX
  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h * 6) % 2) - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (1 / 6 <= h && h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (2 / 6 <= h && h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (3 / 6 <= h && h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (4 / 6 <= h && h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else if (5 / 6 <= h && h < 1) {
      r = c;
      g = 0;
      b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (c: number) => ("0" + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
