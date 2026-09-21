import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { Avatar } from "@openng/optimus-ui/avatar";

const AVATAR_PALETTE = [
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

const EMPTY_LABEL = "N/A";

function initialsFor(name: string): string {
  const [first, second] = name.split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}

function hashFor(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function backgroundColorFor(text: string): string {
  const index = Math.abs(hashFor(text)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 1 / 6) {
    r = c;
    g = x;
  } else if (1 / 6 <= h && h < 2 / 6) {
    r = x;
    g = c;
  } else if (2 / 6 <= h && h < 3 / 6) {
    g = c;
    b = x;
  } else if (3 / 6 <= h && h < 4 / 6) {
    g = x;
    b = c;
  } else if (4 / 6 <= h && h < 5 / 6) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (value: number): string =>
    ("0" + Math.round((value + m) * 255).toString(16)).slice(-2);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function darkenedColor(
  hex: string,
  lightnessReduction: number,
  saturationIncrease: number,
): string {
  const [h, s, l] = hexToHsl(hex);
  const nextL = Math.max(0, l - lightnessReduction);
  const nextS = Math.min(100, s + saturationIncrease);
  return hslToHex(h, nextS, nextL);
}

@Component({
  selector: "app-avatar-component",
  imports: [Avatar],
  templateUrl: "./avatar-component.html",
  styleUrl: "./avatar-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  text = input<string>();
  url = input<string>();
  size = input<"normal" | "large" | "xlarge" | undefined>("normal");
  shape = input<"square" | "circle" | undefined>("circle");

  protected readonly avatar = computed(() => {
    const text = this.text()?.trim() ?? "";
    return text ? initialsFor(text) : EMPTY_LABEL;
  });

  protected readonly bgColor = computed(() =>
    backgroundColorFor(this.text()?.trim() || EMPTY_LABEL),
  );

  protected readonly color = computed(() =>
    darkenedColor(this.bgColor(), 25, 25),
  );
}