import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  output,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {CreateUnit} from '@nexhouse/shared-domain/interfaces';
import {BaseCatalogModel, NeighStreetModel, UserModel} from '@nexhouse/shared-domain/models';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {Select} from '@openng/optimus-ui/select';
import {ToggleSwitch} from '@openng/optimus-ui/toggleswitch';
import {FormValidationErrorComponent} from '../form-validation-error/form-validation-error';
import {NewUnitForm} from './unit-form';

/** Tracked accessor for a control's touched state (see AbstractControl._touched). */
type TrackedControl = AbstractControl & {readonly _touched?: () => boolean};

@Component({
  selector: 'app-unit-form-component',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    Select,
    ToggleSwitch,
    FormValidationErrorComponent,
  ],
  templateUrl: './unit-form-component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UnitFormComponent,
      multi: true,
    },
  ],
})
export class UnitFormComponent implements OnInit, ControlValueAccessor {
  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  user = input<UserModel>();
  handledByParent = input<boolean>(false);

  doSubmit = output<CreateUnit>();

  protected readonly parentTouched = computed(() => {
    const control = this.ngControl?.control as TrackedControl | null | undefined;
    return control?._touched?.() ?? control?.touched ?? false;
  });

  protected readonly isStreetInvalid = computed(() => {
    const ctrl = this.form.controls.streetId;
    return ctrl.invalid && (ctrl.touched || this.parentTouched());
  });

  protected readonly isIdentifierInvalid = computed(() => {
    const ctrl = this.form.controls.unitIdentifier;
    return ctrl.invalid && (ctrl.touched || this.parentTouched());
  });

  protected readonly form = new FormGroup<NewUnitForm>({
    streetId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    unitIdentifier: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    unitTypeId: new FormControl('', {
      nonNullable: true,
    }),
    unitRoleId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isCurrentOccupant: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly injector = inject(Injector);
  private _ngControl: NgControl | null | undefined;
  private get ngControl(): NgControl | null {
    this._ngControl ??= this.injector.get(NgControl, null, {self: true});
    return this._ngControl;
  }
  private onChange: (value: CreateUnit | null) => void = () => {
    /* noop – replaced by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* noop – replaced by registerOnTouched */
  };

  formChanges = toSignal(this.form.valueChanges);
  constructor() {
    effect(() => {
      const nChanges = this.formChanges();
      if (nChanges) {
        const payload = nChanges as CreateUnit;
        const userId = this.user()?.publicId;
        if (userId) {
          payload.userId = userId;
        }
        this.onChange(payload);
      }
    });
  }

  ngOnInit(): void {
    if (!this.handledByParent()) {
      this.applyCatalogDefaults();
    }
  }

  private applyCatalogDefaults(): void {
    const fUnitType = this.unitTypes()[0];
    const fUnitRole = this.unitRoles()[0];
    this.form.patchValue(
      {
        unitTypeId: fUnitType?.publicId ?? '',
        unitRoleId: fUnitRole?.publicId ?? '',
      },
      {emitEvent: false},
    );
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.form.getRawValue() as CreateUnit;
    payload.userId = this.user()?.publicId;
    this.doSubmit.emit(payload);
  }

  writeValue(value: CreateUnit | null): void {
    if (value) {
      this.form.patchValue(value);
    } else {
      this.form.reset({}, {emitEvent: false});
      this.applyCatalogDefaults();
    }
  }

  registerOnChange(fn: (value: CreateUnit | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({emitEvent: false});
    } else {
      this.form.enable({emitEvent: false});
    }
  }
}
