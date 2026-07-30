import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { UserStats } from "@nexhouse/shared-domain/interfaces";
import { Panel } from "primeng/panel";
import { Tag } from "primeng/tag";

@Component({
  selector: "app-resident-stats",
  imports: [Panel, Tag],
  templateUrl: "./resident-stats.html",
  styleUrl: "./resident-stats.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentStats {
  stats = input<UserStats>();
}
