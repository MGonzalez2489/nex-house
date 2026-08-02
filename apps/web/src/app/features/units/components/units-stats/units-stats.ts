import { KeyValuePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { UnitStats } from "@nexhouse/shared-domain/interfaces";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-units-stats",
  imports: [Panel, KeyValuePipe],
  templateUrl: "./units-stats.html",
  styleUrl: "./units-stats.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsStats {
  stats = input<UnitStats>();
}
