import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { SessionService } from "@core/services";
import { ContextStore } from "@stores/context.store";

@Component({
  selector: "app-resident-dashboard",
  imports: [],
  templateUrl: "./resident-dashboard.html",
  styleUrl: "./resident-dashboard.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentDashboard {
  protected readonly contextStore = inject(ContextStore);
  protected readonly sessionService = inject(SessionService);

  protected readonly fullAddress = computed(() => {
    const user = this.sessionService.user();
    if (!user) return "";

    const unit = user.assignments[0]?.unit;

    if (!unit) return "";

    return `${unit.street} , ${unit.identifier}`;
  });
}
