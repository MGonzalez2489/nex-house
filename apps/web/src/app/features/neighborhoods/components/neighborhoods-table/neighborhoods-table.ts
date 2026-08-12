import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  ApiPaginationMeta,
  SearchNeigh,
} from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent, DataViewerComponent } from "@shared/components";
import { TableColumn } from "@shared/components/data-viewer-component";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { NeighStatusTag } from "../neigh-status-tag/neigh-status-tag";
import { TableLazyLoadEvent } from "primeng/table";

@Component({
  selector: "app-neighborhoods-table",
  imports: [
    NeighStatusTag,
    Button,
    DataViewerComponent,
    DatePipe,
    Panel,
    NeighStatusTag,
    AvatarComponent,
    RouterLink,
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

  readonly paginate = output<Partial<SearchNeigh>>();

  onView(id: string): void {
    this.router.navigate(["/neighborhoods/", id]);
  }

  search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }
}
