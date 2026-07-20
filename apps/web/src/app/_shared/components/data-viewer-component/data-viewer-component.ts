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
import { ApiPaginationMeta } from "@nexhouse/shared-domain/interfaces";
import { TableColumn } from "./table-column.interface";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Table as PTable } from "primeng/table";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: "app-data-viewer-component",
  imports: [TableModule, NgTemplateOutlet],
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
  lazy = input<boolean>(false);
  loadOnInit = input<boolean>(false);

  //outputs
  filter = output<TableLazyLoadEvent>();

  // children templates (Signal Queries)
  bodyTemplate = contentChild<TemplateRef<any>>("body");
  actionsTemplate = contentChild<TemplateRef<any>>("actions");
  captionTemplate = contentChild<TemplateRef<any>>("caption");

  loadingTemplate = contentChild<TemplateRef<any>>("loading");
  listTemplate = contentChild<TemplateRef<any>>("list");

  private table = viewChild.required<PTable>("dt");
  public filterGlobal(value: string, mode = "contains") {
    this.table().filterGlobal(value, mode);
  }

  protected isTable = computed(() => this.mode() === "table");
}
