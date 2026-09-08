import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";
import {
  BaseCatalogModel,
  NeighStreetModel,
  UserModel,
} from "@nexhouse/shared-domain/models";
import {
  FormValidationErrorComponent,
  UnitFormComponent,
} from "@shared/components/forms";
import { Button } from "@openng/optimus-ui/button";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { Panel } from "@openng/optimus-ui/panel";
import { Select } from "@openng/optimus-ui/select";
import { ToggleSwitch } from "@openng/optimus-ui/toggleswitch";

@Component({
  selector: "app-onboarding-unit-component",
  imports: [Button, Panel, UnitFormComponent],
  templateUrl: "./onboarding-unit-component.html",
  styleUrl: "./onboarding-unit-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingUnitComponent {
  next = output();
  prev = output();
  doSubmit = output<CreateUnit>();

  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  user = input<UserModel>();
}
