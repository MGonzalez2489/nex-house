import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { SessionService } from "@core/services";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { ONBOARDING_ROUTES_ENUM } from "@onboarding/onboarding.routes";
import { NavBar } from "@shared/layout/components";

@Component({
  selector: "app-resident-layout",
  imports: [RouterOutlet, NavBar],
  templateUrl: "./resident-layout.html",
  styleUrl: "./resident-layout.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentLayout {
  private readonly router = inject(Router);
  protected readonly sessionService = inject(SessionService);
  private readonly currentUrl = signal(this.router.url);

  showNavComponentes = computed(() => {
    const cUser = this.sessionService.user();

    if (!cUser) return false;

    const path = this.currentUrl();

    if (path.includes(ONBOARDING_ROUTES_ENUM.HOME)) return false;

    return cUser.status?.name === UserStatusEnum.ACTIVE;
  });

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }
}
