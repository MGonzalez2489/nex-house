import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProfileFormComponent } from "@shared/components/forms";
import { UserStore } from "@stores/user.store";

@Component({
  selector: "app-dashboard-container",
  imports: [ProfileFormComponent],
  templateUrl: "./dashboard-container.html",
  styleUrl: "./dashboard-container.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainer {
  store = inject(UserStore);
}
