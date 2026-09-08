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
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { Select } from "primeng/select";
import { ToggleSwitch } from "primeng/toggleswitch";

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
