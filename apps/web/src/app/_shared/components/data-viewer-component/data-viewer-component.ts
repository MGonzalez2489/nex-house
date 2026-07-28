import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  output,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { ApiPaginationMeta, Search } from "@nexhouse/shared-domain/interfaces";
import { TableColumn } from "./table-column.interface";
import { TableLazyLoadEvent, TableModule, TablePageEvent } from "primeng/table";
import { Table as PTable } from "primeng/table";
import { NgTemplateOutlet } from "@angular/common";
import { PaginatorModule, PaginatorState } from "primeng/paginator";

@Component({
  selector: "app-data-viewer-component",
  imports: [TableModule, NgTemplateOutlet, PaginatorModule],
  templateUrl: "./data-viewer-component.html",
  styleUrl: "./data-viewer-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewerComponent<T> {
  // Inputs
  mode = input<"table" | "list">("table");
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();
  showActions = input<boolean>(true);
  lazy = input<boolean>(true);
  loadOnInit = input<boolean>(false);
  isMobileView = input<boolean>(false);

  //outputs
  filter = output<TableLazyLoadEvent>();

  // children templates (Signal Queries)
  bodyTemplate = contentChild<TemplateRef<any>>("body");
  actionsTemplate = contentChild<TemplateRef<any>>("actions");
  captionTemplate = contentChild<TemplateRef<any>>("caption");

  loadingTemplate = contentChild<TemplateRef<any>>("loading");
  listTemplate = contentChild<TemplateRef<any>>("list");
  mobileTemplate = contentChild<TemplateRef<any>>("mobile");

  private table = viewChild.required<PTable>("dt");
  public filterGlobal(value: string, mode = "contains") {
    this.table().filterGlobal(value, mode);
  }

  protected isTable = computed(() => this.mode() === "table");

  protected paginatorReport = computed(() => {
    const currentPagination = this.pagination();
    if (!currentPagination) {
      return {
        first: 0,
        last: 0,
        totalRecords: 0,
      }; // Or a suitable default/loading message
    }

    const { total, page, limit } = currentPagination;

    const first = (page - 1) * limit + 1;
    // Ensure 'last' does not exceed 'total' records
    const last = Math.min(page * limit, total);
    const totalRecords = total;

    return {
      first,
      last,
      totalRecords,
    };
    // return `${first} - ${last} de ${totalRecords}`;
  });

  search(event: TableLazyLoadEvent): void {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? "createdAt",
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? "",
    };

    this.filter.emit(searchParams);
  }
  searchPage(event: TablePageEvent) {
    // const cPagination = this.pagination();

    const first = event.first ?? 0;
    const rows = event.rows ?? 10;

    this.filter.emit({
      first,
      rows,
    });
  }

  changePage(event: PaginatorState) {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.filter.emit({
      first,
      rows,
    });
  }
}
