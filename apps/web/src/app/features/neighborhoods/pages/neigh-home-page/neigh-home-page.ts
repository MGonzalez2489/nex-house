import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "@core/services";
import { NEIGHBORHOOD_ROUTES_ENUM } from "@neighborhoods/neighborhood.routes";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { Button } from "@openng/optimus-ui/button";
import { FormFeedback } from "@shared/components/forms";
import { NeighborhoodsTable } from "../../components";

@Component({
  selector: "app-neigh-home-page",
  imports: [NeighborhoodsTable, Button, FormFeedback],
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
  protected readonly totalRegistered = computed(
    () => this.neighStore.pagination()?.total ?? this.entries().length,
  );

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
