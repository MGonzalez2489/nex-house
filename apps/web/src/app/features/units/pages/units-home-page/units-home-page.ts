import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ContextStore } from "@stores/context.store";
import { UnitsStats, UnitsTable } from "@units/components";
import { UnitsFilters } from "@units/components/units-filters/units-filters";
import { UnitStore } from "@units/units.store";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-units-home-page",
  imports: [Panel, UnitsTable, UnitsStats, UnitsFilters],
  templateUrl: "./units-home-page.html",
  styleUrl: "./units-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsHomePage implements OnInit {
  protected readonly contextStore = inject(ContextStore);
  protected readonly unitStore = inject(UnitStore);

  ngOnInit(): void {
    this.unitStore.loadAll({
      rows: 10,
      first: 0,
    });
  }
}
