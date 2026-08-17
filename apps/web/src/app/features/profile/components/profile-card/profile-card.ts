import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { UserModel } from "@nexhouse/shared-domain/models";
import { AvatarComponent, AvatarUploadComponent } from "@shared/components";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-profile-card",
  imports: [Panel, AvatarComponent, AvatarUploadComponent],
  templateUrl: "./profile-card.html",
  styleUrl: "./profile-card.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCard {
  readonly user = input.required<UserModel>();
  readonly refresh = output();

  address = computed(() => {
    const add = this.user().userUnits.find((f) => f.isCurrentOccupant);
    if (!add) return "--";

    return `${add.unit?.street?.name} ${add.unit?.identifier}`;
  });
}
