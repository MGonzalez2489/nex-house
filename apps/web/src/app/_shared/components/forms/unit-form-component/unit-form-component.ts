import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  BaseCatalogModel,
  NeighStreetModel,
  UserModel,
} from "@nexhouse/shared-domain/models";
import { Button } from "@openng/optimus-ui/button";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { Select } from "@openng/optimus-ui/select";
import { ToggleSwitch } from "@openng/optimus-ui/toggleswitch";
import { FormValidationErrorComponent } from "../form-validation-error/form-validation-error";
import { NewUnitForm } from "./unit-form";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";

@Component({
  selector: "app-unit-form-component",
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    Select,
    ToggleSwitch,
    FormValidationErrorComponent,
    Button,
  ],
  templateUrl: "./unit-form-component.html",
  styleUrl: "./unit-form-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitFormComponent implements OnInit {
  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  user = input<UserModel>();

  doSubmit = output<CreateUnit>();

  protected readonly form = new FormGroup<NewUnitForm>({
    streetId: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    unitIdentifier: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    unitTypeId: new FormControl("", {
      nonNullable: true,
    }),

    unitRoleId: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isCurrentOccupant: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  ngOnInit(): void {
    this.doInit();
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const payload = this.form.value as CreateUnit;
    payload.userId = this.user()?.publicId;
    this.doSubmit.emit(payload);
  }

  private doInit() {
    const fUnitType = this.unitTypes()[0];
    const fUnitRole = this.unitRoles()[0];

    this.form.patchValue({
      unitTypeId: fUnitType?.publicId,
      unitRoleId: fUnitRole?.publicId,
    });
  }
}
