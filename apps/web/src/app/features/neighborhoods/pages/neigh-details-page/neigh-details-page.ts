import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import { NeighStatusTag } from "@neighborhoods/components";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";

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

  id = input<string>();

  protected readonly neighborhood = computed(() =>
    this.store.entities().find((f) => f.publicId === this.id()),
  );

  back(): void {
    this.router.navigate(["/neighborhoods"]);
  }
}
