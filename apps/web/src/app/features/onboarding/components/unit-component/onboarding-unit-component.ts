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
import { FormValidationErrorComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { Select } from "primeng/select";
import { ToggleSwitch } from "primeng/toggleswitch";

interface NewUnitForm {
  streetId: FormControl<string | undefined>;
  unitTypeId: FormControl<string | undefined>;
  unitIdentifier: FormControl<string | undefined>;

  unitRoleId: FormControl<string | undefined>;
  isCurrentOccupant: FormControl<boolean>;
}

@Component({
  selector: "app-onboarding-unit-component",
  imports: [
    Button,
    ReactiveFormsModule,
    Panel,
    InputTextModule,
    Select,
    ToggleSwitch,
    FormValidationErrorComponent,
  ],
  templateUrl: "./onboarding-unit-component.html",
  styleUrl: "./onboarding-unit-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingUnitComponent implements OnInit {
  next = output();
  prev = output();
  doSubmit = output<CreateUnit>();

  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  user = input<UserModel>();

  ngOnInit(): void {
    this.initCreate();
  }

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

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (!this.form.dirty) this.next.emit();

    const payload = this.form.value as CreateUnit;
    payload.userId = this.user()?.publicId;
    this.doSubmit.emit(payload);
  }

  private initCreate() {
    const fUnitType = this.unitTypes()[0];
    const fUnitRole = this.unitRoles()[0];

    this.form.patchValue({
      unitTypeId: fUnitType.publicId,
      unitRoleId: fUnitRole?.publicId,
    });
  }
}
