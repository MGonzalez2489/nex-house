import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import {
  ApiPaginationMeta,
  SearchNeigh,
} from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent } from "@shared/components";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { NeighStatusTag } from "../neigh-status-tag/neigh-status-tag";
import { NeighTableFilters } from "../neigh-table-filters/neigh-table-filters";

@Component({
  selector: "app-neighborhoods-table",
  imports: [
    NeighStatusTag,
    Button,
    Panel,
    NeighStatusTag,
    AvatarComponent,
    TableModule,
    NeighTableFilters,
  ],
  templateUrl: "./neighborhoods-table.html",
  styleUrl: "./neighborhoods-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeighborhoodsTable {
  readonly items = input.required<NeighborhoodModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);
  readonly isMobile = input<boolean>(false);

  readonly paginate = output<Partial<SearchNeigh>>();
  readonly view = output<string>();

  search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }

  protected filter(event: SearchNeigh) {
    this.paginate.emit({
      ...event,
    });
  }
}
