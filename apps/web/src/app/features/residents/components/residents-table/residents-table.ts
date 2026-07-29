import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import { ApiPaginationMeta } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { AvatarComponent } from "@shared/components";
import {
  DataViewerComponent,
  TableColumn,
} from "@shared/components/data-viewer-component";
import { Button } from "primeng/button";

@Component({
  selector: "app-residents-table",
  imports: [DataViewerComponent, AvatarComponent, Button],
  templateUrl: "./residents-table.html",
  styleUrl: "./residents-table.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentsTable {
  private readonly router = inject(Router);
  readonly items = input.required<UserModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input<boolean>(false);

  protected readonly cols: TableColumn<UserModel>[] = [
    { field: "fullName", header: "Nombre(s)" },
    { field: "email", header: "Email" },
    { field: "phone", header: "Teléfono" },
  ];

  onView(id: string): void {
    const route =
      `/${RESIDENT_ROUTES_ENUM.HOME}/${RESIDENT_ROUTES_ENUM.UPDATE}`.replace(
        ":id",
        id,
      );
    this.router.navigate([route]);
  }
}
