import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { Search } from "@nexhouse/shared-domain/interfaces";
import { ContextStore } from "@stores/context.store";
import { UnitsStats, UnitsTable } from "@units/components";
import { UNIT_ROUTES_ENUM } from "@units/units.routes";
import { UnitStore } from "@units/units.store";

@Component({
  selector: "app-units-home-page",
  imports: [UnitsTable, UnitsStats],
  templateUrl: "./units-home-page.html",
  styleUrl: "./units-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsHomePage implements OnInit {
  private readonly router = inject(Router);
  protected readonly contextStore = inject(ContextStore);
  protected readonly unitStore = inject(UnitStore);

  ngOnInit(): void {
    this.unitStore.loadStats();
  }

  search(filters: Search) {
    this.unitStore.loadAll(filters);
  }
  view(id: string): void {
    this.router.navigate([`/${UNIT_ROUTES_ENUM.HOME}`, id]);
  }
}
