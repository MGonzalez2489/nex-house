import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { ApiPaginationMeta } from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { Button } from "primeng/button";
import { TableModule } from "primeng/table";
import { NeighStatusTag } from "../neigh-status-tag/neigh-status-tag";

@Component({
  selector: "app-neighborhoods-table",
  imports: [NeighStatusTag, TableModule, Button],
  templateUrl: "./neighborhoods-table.html",
  styleUrl: "./neighborhoods-table.css",
})
export class NeighborhoodsTable {
  private readonly router = inject(Router);
  //pending to move to an specific component
  lazy = signal(false);
  loadOnInit = signal(false);

  items = input.required<NeighborhoodModel[]>();
  pagination = input<ApiPaginationMeta>();

  readonly currentPage = signal(1);

  readonly totalFiltered = computed(() => 3);
  readonly totalPages = computed(() => 5);

  readonly paginated = computed(() => {
    return [
      {
        id: "1",
        name: "neigh 1",
        active: true,
        municipality: "municipality",
        streets: [{}, {}, {}],
        createdAt: "1234",
      },
      {
        id: "2",
        name: "neigh 2",
        active: true,
        municipality: "municipality",
        streets: [{}, {}, {}],
        createdAt: "1234",
      },
      {
        id: "3",
        name: "neigh 3",
        active: true,
        municipality: "municipality",
        streets: [{}, {}, {}],
        createdAt: "1234",
      },
      {
        id: "4",
        name: "neigh 4",
        active: true,
        municipality: "municipality",
        streets: [{}, {}, {}],
        createdAt: "1234",
      },
    ];
  });

  constructor() {
    effect(() => {
      this.currentPage.set(1);
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }
  readonly rangeLabel = computed(() => {
    const total = this.totalFiltered();
    if (total === 0) return "Sin resultados";
    const start = (this.currentPage() - 1) * 8 + 1;
    const end = Math.min(start + 10 - 1, total);
    return `${start}–${end} de ${total}`;
  });
  onView(id: string): void {
    this.router.navigate(["/neighborhoods/", id]);
  }
}
