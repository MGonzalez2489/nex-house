import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { Button } from "primeng/button";
import { NeighborhoodsTable, NeighTableFilters } from "../../components";

@Component({
  selector: "app-neigh-home-page",
  imports: [NeighborhoodsTable, NeighTableFilters, Button],
  templateUrl: "./neigh-home-page.html",
  styleUrl: "./neigh-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighHomePage implements OnInit {
  private readonly router = inject(Router);
  protected readonly neighStore = inject(NeighborhoodsStore);

  protected readonly entries = computed(() => this.neighStore.entities());
  protected readonly activeEntries = computed(
    () => this.entries().filter((g) => g.isActive).length,
  );

  ngOnInit(): void {
    this.onSearch({});
  }

  onCreate(): void {
    this.router.navigate(["/neighborhoods/new"]);
  }

  onSearch(filters: SearchNeigh) {
    this.neighStore.loadAll(filters);
  }
}
