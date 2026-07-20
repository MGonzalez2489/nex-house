import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthStore } from "@auth/store";
import { fromEvent, debounceTime, startWith } from "rxjs";

export type ViewSize = "small" | "medium" | "large";

const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

@Injectable({
  providedIn: "root",
})
export class SessionService {
  //injects
  private readonly authStore = inject(AuthStore);
  readonly _viewSize: WritableSignal<ViewSize> = signal(
    this.getViewSize(window.innerWidth),
  );

  constructor() {
    fromEvent(window, "resize")
      .pipe(
        debounceTime(100), // Debounce to prevent excessive updates
        startWith(null), // Emit initial value
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._viewSize.set(this.getViewSize(window.innerWidth));
      });
  }

  //properties
  user = computed(() => this.authStore.user());
  isMobile = computed(() => this._viewSize() === "small");

  private getViewSize(width: number): ViewSize {
    if (width < TAILWIND_BREAKPOINTS.md) {
      return "small";
    } else if (
      width >= TAILWIND_BREAKPOINTS.md &&
      width < TAILWIND_BREAKPOINTS.lg
    ) {
      return "medium";
    } else {
      return "large";
    }
  }
}
