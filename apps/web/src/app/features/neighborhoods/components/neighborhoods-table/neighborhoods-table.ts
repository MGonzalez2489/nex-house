import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import {
  ApiPaginationMeta,
  SearchNeigh,
} from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent } from "@shared/components";
import { Button } from "@openng/optimus-ui/button";
import { Panel } from "@openng/optimus-ui/panel";
import { Paginator } from "@openng/optimus-ui/paginator";
import { TableLazyLoadEvent, TableModule } from "@openng/optimus-ui/table";
import { NeighStatusTag } from "../neigh-status-tag/neigh-status-tag";
import { NeighTableFilters } from "../neigh-table-filters/neigh-table-filters";

@Component({
  selector: "app-neighborhoods-table",
  imports: [
    Button,
    Panel,
    Paginator,
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

  protected readonly pageFirst = computed(() => {
    const pagination = this.pagination();
    return pagination ? (pagination.page - 1) * pagination.limit : 0;
  });

  protected readonly pageRows = computed(
    () => this.pagination()?.limit ?? 10,
  );

  search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }

  paginateMobile(event: { first?: number; rows?: number }) {
    this.paginate.emit({
      first: event.first ?? 0,
      rows: event.rows || 10,
    });
  }

  protected filter(event: SearchNeigh) {
    this.paginate.emit({
      ...event,
    });
  }
}
