import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  NeighborhoodModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-profile-unit",
  imports: [Panel],
  templateUrl: "./profile-unit.html",
  styleUrl: "./profile-unit.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUnit {
  neighborhood = input<NeighborhoodModel>();
  userUnits = input<UserUnitModel[]>();

  current = computed(
    () => this.userUnits()?.find((f) => f.isCurrentOccupant)?.unit,
  );
}
