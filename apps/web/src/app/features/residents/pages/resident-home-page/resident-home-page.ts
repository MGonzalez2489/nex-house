import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { SearchUser } from "@nexhouse/shared-domain/interfaces";
import {
  ResidentFilters,
  ResidentsTable,
  ResidentStats,
} from "@residents/components";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { ResidentStore } from "@residents/resident.store";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-resident-home-page",
  imports: [
    Button,
    ResidentsTable,
    Panel,
    InputTextModule,
    ResidentFilters,
    ResidentStats,
  ],
  templateUrl: "./resident-home-page.html",
  styleUrl: "./resident-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentHomePage implements OnInit {
  protected readonly router = inject(Router);
  protected readonly store = inject(ResidentStore);
  ngOnInit(): void {
    this.store.loadAll({ rows: 10, first: 0 });
    this.store.loadStats();
  }

  create() {
    const route = `/${RESIDENT_ROUTES_ENUM.HOME}/${RESIDENT_ROUTES_ENUM.NEW}`;
    this.router.navigateByUrl(route);
  }

  onSearch(filters: SearchUser) {
    this.store.loadAll(filters);
  }
}
