import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { ApiPaginationMeta } from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { DataViewerComponent } from "@shared/components";
import { TableColumn } from "@shared/components/data-viewer-component";
import { Button } from "primeng/button";
import { NeighStatusTag } from "../neigh-status-tag/neigh-status-tag";
import { DatePipe } from "@angular/common";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-neighborhoods-table",
  imports: [
    NeighStatusTag,
    Button,
    DataViewerComponent,
    DatePipe,
    Panel,
    NeighStatusTag,
  ],
  templateUrl: "./neighborhoods-table.html",
  styleUrl: "./neighborhoods-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsTable {
  private readonly router = inject(Router);

  protected readonly cols: TableColumn<NeighborhoodModel>[] = [
    { field: "name", header: "Nombre" },
    { field: "streets", header: "Calles" },
    { field: "isActive", header: "Estado" },
  ];

  readonly items = input.required<NeighborhoodModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);
  readonly isMobile = input<boolean>(false);

  onView(id: string): void {
    this.router.navigate(["/neighborhoods/", id]);
  }
}
