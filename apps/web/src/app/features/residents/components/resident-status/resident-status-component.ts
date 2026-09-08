import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { UserStatusModel } from "@nexhouse/shared-domain/models";
import { TagModule } from "@openng/optimus-ui/tag";
import { BadgeSeverity } from "@openng/optimus-ui/types/badge";

@Component({
  selector: "app-resident-status-component",
  imports: [TagModule],
  templateUrl: "./resident-status-component.html",
  styleUrl: "./resident-status-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentStatusComponent {
  status = input.required<UserStatusModel>();

  severity = computed<BadgeSeverity | undefined | null>(() => {
    const cStatus = this.status();

    switch (cStatus.name) {
      case UserStatusEnum.ACTIVE:
        return "success";
      case UserStatusEnum.INACTIVE:
        return "secondary";
      case UserStatusEnum.PENDING_ONBOARDING:
        return "warn";
      default:
        return "secondary";
    }
  });
}
