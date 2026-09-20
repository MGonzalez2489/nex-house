import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { NeighStatusTag } from "@neighborhoods/components";
import { NEIGHBORHOOD_ROUTES_ENUM } from "@neighborhoods/neighborhood.routes";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { Button } from "@openng/optimus-ui/button";
import { Panel } from "@openng/optimus-ui/panel";

@Component({
  selector: "app-neigh-details-page",
  imports: [Button, Panel, DatePipe, NeighStatusTag],
  templateUrl: "./neigh-details-page.html",
  styleUrl: "./neigh-details-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighDetailsPage {
  private readonly router = inject(Router);
  private readonly store = inject(NeighborhoodsStore);

  protected id = input<string>();

  neighborhood = signal<NeighborhoodModel | undefined>(undefined);

  constructor() {
    effect(async () => {
      const cId = this.id();
      if (!cId) return;

      const cN = await this.store.findById(cId);

      if (cN) {
        this.neighborhood.set(cN);
      }
    });
  }

  back(): void {
    this.router.navigate([NEIGHBORHOOD_ROUTES_ENUM.HOME]);
  }
  edit() {
    this.router.navigate([
      NEIGHBORHOOD_ROUTES_ENUM.HOME,
      this.neighborhood()?.publicId,
      "edit",
    ]);
  }
}
