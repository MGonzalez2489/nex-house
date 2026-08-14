import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { UserModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent } from "@shared/components";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-profile-card",
  imports: [Panel, AvatarComponent],
  templateUrl: "./profile-card.html",
  styleUrl: "./profile-card.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCard {
  user = input.required<UserModel>();

  address = computed(() => {
    const add = this.user().userUnits.find((f) => f.isCurrentOccupant);
    if (!add) return "--";

    return `${add.unit?.street?.name} ${add.unit?.identifier}`;
  });
}
