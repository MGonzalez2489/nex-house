import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { UnitFormComponent } from "@shared/components/forms";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
import { UserStore } from "@user/user.store";

@Component({
  selector: "app-dashboard-container",
  imports: [UnitFormComponent],
  templateUrl: "./dashboard-container.html",
  styleUrl: "./dashboard-container.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainer {
  store = inject(UserStore);
  catStore = inject(CatalogsStore);
  context = inject(ContextStore);
}
