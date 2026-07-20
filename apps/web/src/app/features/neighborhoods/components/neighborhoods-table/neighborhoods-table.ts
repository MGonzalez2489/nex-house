import { Component, inject, input, signal } from "@angular/core";
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

  items = input.required<NeighborhoodModel[]>();
  pagination = input<ApiPaginationMeta>();
  isLoading = input<boolean>(false);

  //pending to move to an specific component
  lazy = signal(false);
  loadOnInit = signal(false);

  onView(id: string): void {
    this.router.navigate(["/neighborhoods/", id]);
  }
}
