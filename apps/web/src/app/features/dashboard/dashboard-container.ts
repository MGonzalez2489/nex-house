import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { UserStore } from "@user/user.store";

@Component({
  selector: "app-dashboard-container",
  imports: [],
  templateUrl: "./dashboard-container.html",
  styleUrl: "./dashboard-container.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainer {
  store = inject(UserStore);
}
