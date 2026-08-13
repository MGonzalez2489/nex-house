import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { SearchUser } from "@nexhouse/shared-domain/interfaces";
import { ResidentsTable, ResidentStats } from "@residents/components";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { ResidentStore } from "@residents/resident.store";
import { Button } from "primeng/button";

@Component({
  selector: "app-resident-home-page",
  imports: [Button, ResidentsTable, ResidentStats],
  templateUrl: "./resident-home-page.html",
  styleUrl: "./resident-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentHomePage implements OnInit {
  protected readonly router = inject(Router);
  protected readonly store = inject(ResidentStore);
  ngOnInit(): void {
    this.store.loadStats();
  }

  create() {
    const route = `/${RESIDENT_ROUTES_ENUM.HOME}/${RESIDENT_ROUTES_ENUM.NEW}`;
    this.router.navigateByUrl(route);
  }
  view(id: string): void {
    const route =
      `/${RESIDENT_ROUTES_ENUM.HOME}/${RESIDENT_ROUTES_ENUM.UPDATE}`.replace(
        ":id",
        id,
      );
    this.router.navigate([route]);
  }

  onSearch(filters: SearchUser) {
    this.store.loadAll(filters);
  }
}
