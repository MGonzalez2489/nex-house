import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  NeighborhoodModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";
import { Panel } from "@openng/optimus-ui/panel";

@Component({
  selector: "app-profile-unit",
  imports: [Panel],
  templateUrl: "./profile-unit.html",
  styleUrl: "./profile-unit.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUnit {
  readonly neighborhood = input<NeighborhoodModel>();
  readonly userUnits = input<UserUnitModel[]>([]);
}