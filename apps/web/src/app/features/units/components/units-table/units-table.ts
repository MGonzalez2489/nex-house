import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  ApiPaginationMeta,
  SearchUser,
} from "@nexhouse/shared-domain/interfaces";
import { UnitModel } from "@nexhouse/shared-domain/models";
import {
  DataViewerComponent,
  TableColumn,
} from "@shared/components/data-viewer-component";
import { Button } from "primeng/button";
import { TableLazyLoadEvent } from "primeng/table";

@Component({
  selector: "app-units-table",
  imports: [DataViewerComponent, Button],
  templateUrl: "./units-table.html",
  styleUrl: "./units-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsTable {
  private readonly router = inject(Router);
  readonly items = input.required<UnitModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);

  readonly paginate = output<Partial<SearchUser>>();

  protected readonly cols: TableColumn<UnitModel>[] = [
    // { field: "street", header: "Calle" },
    { field: "identifier", header: "Identificador" },
    { field: "userUnits", header: "Habitantes" },
  ];

  onView(id: string): void {
    console.log("view id", id);
    // const route =
    //   `/${RESIDENT_ROUTES_ENUM.HOME}/${RESIDENT_ROUTES_ENUM.UPDATE}`.replace(
    //     ":id",
    //     id,
    //   );
    // this.router.navigate([route]);
  }

  search(event: TableLazyLoadEvent) {
    this.paginate.emit({
      first: event.first,
      rows: event.rows || 10,
    });
  }
}
