import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import {
  ApiPaginationMeta,
  Search,
  SearchUser,
} from "@nexhouse/shared-domain/interfaces";
import { UnitModel } from "@nexhouse/shared-domain/models";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { UnitsFilters } from "../units-filters/units-filters";

@Component({
  selector: "app-units-table",
  imports: [Button, TableModule, Panel, UnitsFilters],
  templateUrl: "./units-table.html",
  styleUrl: "./units-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsTable {
  readonly items = input.required<UnitModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);

  readonly paginate = output<Partial<SearchUser>>();
  readonly view = output<string>();

  protected search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }
  protected filter(event: Search) {
    this.paginate.emit({
      ...event,
    });
  }
}
