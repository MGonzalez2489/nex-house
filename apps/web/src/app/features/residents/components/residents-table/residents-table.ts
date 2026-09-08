import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import {
  ApiPaginationMeta,
  SearchUser,
} from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent } from "@shared/components";
import { Button } from "@openng/optimus-ui/button";
import { TableLazyLoadEvent, TableModule } from "@openng/optimus-ui/table";

//
import { PanelModule } from "@openng/optimus-ui/panel";
import { ResidentStatusComponent } from "../resident-status/resident-status-component";
import { ResidentFilters } from "../resident-filters/resident-filters";

@Component({
  selector: "app-residents-table",
  imports: [
    AvatarComponent,
    Button,
    ResidentStatusComponent,
    PanelModule,
    TableModule,
    ResidentFilters,
  ],
  templateUrl: "./residents-table.html",
  styleUrl: "./residents-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentsTable {
  readonly items = input.required<UserModel[]>();
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
  protected filter(event: SearchUser) {
    this.paginate.emit({
      ...event,
    });
  }
}
