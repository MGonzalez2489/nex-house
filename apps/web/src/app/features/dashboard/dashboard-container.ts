import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { SessionService } from "@core/services";
import { AdminDashboard, ResidentDashboard } from "./pages";

@Component({
  selector: "app-dashboard-container",
  imports: [AdminDashboard, ResidentDashboard],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (when role()) {
      @switch (role()) {
        @case ("admin") {
          <app-admin-dashboard />
        }
        @case ("resident") {
          <app-resident-dashboard />
        }
        @default {
          <h2>Default view</h2>
          <!-- <app-unauthorized-view /> -->
        }
      }
    } @placeholder {
      <h1>Placeholder</h1>
      <!-- <p-skeleton width="100%" height="80vh" /> -->
    }
  `,
})
export class DashboardContainer {
  private readonly sessionService = inject(SessionService);
  protected readonly role = this.sessionService.role;
}
