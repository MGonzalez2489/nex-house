import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "@core/services";
import { NEIGHBORHOOD_ROUTES_ENUM } from "@neighborhoods/neighborhood.routes";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { Button } from "primeng/button";
import { NeighborhoodsTable } from "../../components";

@Component({
  selector: "app-neigh-home-page",
  imports: [NeighborhoodsTable, Button],
  templateUrl: "./neigh-home-page.html",
  styleUrl: "./neigh-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighHomePage {
  private readonly router = inject(Router);
  protected readonly neighStore = inject(NeighborhoodsStore);
  protected readonly sessionService = inject(SessionService);

  protected readonly entries = computed(() => this.neighStore.entities());
  protected readonly activeEntries = computed(
    () => this.entries().filter((g) => g.isActive).length,
  );
  protected readonly isFiltering = signal<boolean>(false);

  constructor() {
    effect(() => {
      const isCMobile = this.sessionService.isMobile();
      if (isCMobile) {
        this.isFiltering.set(true);
      }
    });
  }

  onCreate(): void {
    this.router.navigate([
      `/${NEIGHBORHOOD_ROUTES_ENUM.HOME}/${NEIGHBORHOOD_ROUTES_ENUM.NEW}`,
    ]);
  }

  onSearch(filters: SearchNeigh) {
    this.neighStore.loadAll(filters);
  }
  onView(id: string) {
    this.router.navigate([`${NEIGHBORHOOD_ROUTES_ENUM.HOME}`, id]);
  }
}
