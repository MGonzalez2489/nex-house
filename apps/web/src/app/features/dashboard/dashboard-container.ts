import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-dashboard-container",
  imports: [],
  templateUrl: "./dashboard-container.html",
  styleUrl: "./dashboard-container.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainer {}
