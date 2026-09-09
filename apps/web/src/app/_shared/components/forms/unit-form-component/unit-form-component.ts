/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  OnInit,
  output,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnitFormComponent),
      multi: true,
    },
  ],
})
export class UnitFormComponent implements OnInit, ControlValueAccessor {
  //inputs
  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  user = input<UserModel>();

  //optional to handle submit
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
  private onChange: (value: CreateUnit | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.doInit();
    this.listenToFormChanges();
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const payload = this.form.value as CreateUnit;
    payload.userId = this.user()?.publicId;
    this.doSubmit.emit(payload);
  }
  private listenToFormChanges(): void {
    // Notifica al padre cada vez que cambien los valores internos
    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        const payload = this.form.value as CreateUnit;
        if (this.user()?.publicId) {
          payload.userId = this.user()?.publicId;
        }
        this.onChange(payload);
      } else {
        // Si no es válido, enviamos null o un valor según tus reglas
        this.onChange(null);
      }
    });
  }

  private doInit() {
    const fUnitType = this.unitTypes()[0];
    const fUnitRole = this.unitRoles()[0];

    this.form.patchValue({
      unitTypeId: fUnitType?.publicId,
      unitRoleId: fUnitRole?.publicId,
    });
  }

  //control value accesor

  // --- MÉTODOS REQUERIDOS POR ControlValueAccessor ---

  // 1. Angular le envía un valor inicial/nuevo desde el padre
  writeValue(value: CreateUnit | null): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    } else {
      this.form.reset({}, { emitEvent: false });
      this.doInit();
    }
  }

  // 2. Registra la función callback que el padre usará para escuchar cambios de valor
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // 3. Registra la función callback para cuando el usuario interactúa ("blur")
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 4. (Opcional) Angular deshabilita/habilita el control
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }
}
