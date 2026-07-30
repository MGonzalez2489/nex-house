import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { UserStatusModel } from "@nexhouse/shared-domain/models";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-resudent-status-component",
  imports: [TagModule],
  templateUrl: "./resudent-status-component.html",
  styleUrl: "./resudent-status-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResudentStatusComponent {
  status = input.required<UserStatusModel>();

  severity = computed<
    | "success"
    | "secondary"
    | "info"
    | "warn"
    | "danger"
    | "contrast"
    | undefined
    | null
  >(() => {
    const cStatus = this.status();
    let sev = "secondary";

    switch (cStatus.name) {
      case UserStatusEnum.ACTIVE:
        sev = "success";
        break;

      case UserStatusEnum.INACTIVE:
        sev = "secondary";
        break;
      case UserStatusEnum.PENDING:
        sev = "warn";
        break;
      default:
        sev = "secondary";
    }

    return sev as any;
  });
}
