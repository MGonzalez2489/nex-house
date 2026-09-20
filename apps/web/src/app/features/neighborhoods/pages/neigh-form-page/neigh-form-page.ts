import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Router} from '@angular/router';
import {NEIGHBORHOOD_ROUTES_ENUM} from '@neighborhoods/neighborhood.routes';
import {NeighborhoodsStore} from '@neighborhoods/neighborhood.store';
import { CreateNeighStreet } from "@nexhouse/shared-domain/interfaces";
import {NeighborhoodModel} from '@nexhouse/shared-domain/models';
import {Badge} from '@openng/optimus-ui/badge';
import {Button} from '@openng/optimus-ui/button';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {Panel} from '@openng/optimus-ui/panel';
import {ToggleSwitchModule} from '@openng/optimus-ui/toggleswitch';
import {FormOptions, FormValidationErrorComponent} from '@shared/components/forms';

import {SelectModule} from '@openng/optimus-ui/select';
import {CatalogsStore} from '@stores/catalogs.store';
import {mapCreateNeighborhoodPayload, mapUpdateNeighborhoodPayload} from './neigh-form.mapper';
@Component({
  selector: 'app-neigh-form-page',
  imports: [
    ReactiveFormsModule,
    Button,
    Panel,
    InputTextModule,
    Badge,
    ToggleSwitchModule,
    FormOptions,
    FormValidationErrorComponent,
    SelectModule,
  ],
  templateUrl: './neigh-form-page.html',
  styleUrl: './neigh-form-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(NeighborhoodsStore);
  protected readonly catStore = inject(CatalogsStore);

  readonly id = input<string>();
  readonly neighborhood = signal<NeighborhoodModel | undefined>(undefined);

  readonly isEdit = computed(() => Boolean(this.id()));

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    //
    countryId: this.fb.nonNullable.control('', [Validators.required]),
    stateId: this.fb.nonNullable.control('', [Validators.required]),
    cityId: this.fb.nonNullable.control('', [Validators.required]),
    zipCode: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(5),
      Validators.minLength(5),
    ]),
    //
    firstAdminEmail: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    active: this.fb.nonNullable.control(true),
    streets: this.fb.array<
      FormGroup<{
        name: FormControl<string>;
        publicId: FormControl<string | null>;
      }>
    >([]),
  });

  get streets(): FormArray<
    FormGroup<{
      name: FormControl<string>;
      publicId: FormControl<string | null>;
    }>
  > {
    return this.form.controls.streets;
  }

  constructor() {
    const cCountry = this.catStore.countries();
    const cStates = this.catStore.states();
    const cCities = this.catStore.cities();

    if (cCountry.length === 0 || cStates.length === 0 || cCities.length === 0) {
      return;
    }

    const mex = cCountry.find((f) => f.name === 'mexico');
    const chi = cStates.find((f) => f.name === 'chihuahua');
    const chic = cCities.find((f) => f.name === 'chihuahua');

    this.form.patchValue({
      countryId: mex?.publicId ?? '',
      stateId: chi?.publicId ?? '',
      cityId: chic?.publicId ?? '',
    });
    this.form.updateValueAndValidity();
  }

  private createStreetFormGroup(street?: CreateNeighStreet): FormGroup<{
    name: FormControl<string>;
    publicId: FormControl<string | null>;
  }> {
    return this.fb.nonNullable.group({
      name: this.fb.nonNullable.control(street?.name || '', [
        Validators.required,
        Validators.minLength(2),
      ]),
      publicId: this.fb.nonNullable.control<string | null>(street?.publicId || null),
    });
  }

  addStreet(): void {
    this.streets.push(this.createStreetFormGroup());
  }

  removeStreet(index: number): void {
    if (this.streets.length > 1) {
      this.streets.removeAt(index);
    } else {
      // If only one street left, reset its values
      this.streets.at(0).reset(this.createStreetFormGroup().getRawValue());
    }
  }

  cancel(): void {
    this.router.navigate([`/${NEIGHBORHOOD_ROUTES_ENUM.HOME}`]);
  }

  async ngOnInit() {
    const cId = this.id();

    if (!cId) this.initForCreate();
    else this.initForUpdate(cId);
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.controls.streets.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const response = this.id() ? await this.update() : await this.create();

    if (response) {
      this.router.navigateByUrl(`/${NEIGHBORHOOD_ROUTES_ENUM.HOME}`);
    }
  }

  private initForCreate() {
    this.setCreationFieldsEnabled(true);
    this.addStreet();
  }
  private async initForUpdate(id: string) {
    const cN = await this.store.findById(id);
    if (!cN) return;

    this.form.patchValue({
      name: cN.name,
      active: cN.isActive,
      zipCode: cN.address?.zipCode ?? '',
    });

    if (cN.address?.city) {
      this.form.patchValue({
        stateId: cN.address.city.state?.publicId ?? this.form.controls.stateId.value,
        cityId: cN.address.city.publicId ?? this.form.controls.cityId.value,
      });
    }

    while (this.streets.length !== 0) {
      this.streets.removeAt(0);
    }

    for (const street of cN.streets) {
      this.streets.push(this.createStreetFormGroup(street));
    }

    if (cN.streets.length === 0) {
      this.streets.push(this.createStreetFormGroup());
    }

    // The PATCH endpoint does not manage location or the first admin, so those
    // fields are locked on creation only forms.
    this.setCreationFieldsEnabled(false);
    this.form.updateValueAndValidity();
  }

  /**
   * Enables/disables the creation-only controls (location + first admin). In
   * edit mode the controls stay disabled so their validators do not block the
   * update submit while the payload remains API-compatible.
   */
  private setCreationFieldsEnabled(enabled: boolean): void {
    const controls = [
      this.form.controls.countryId,
      this.form.controls.stateId,
      this.form.controls.cityId,
      this.form.controls.zipCode,
      this.form.controls.firstAdminEmail,
    ];
    controls.forEach((control) =>
      enabled ? control.enable() : control.disable(),
    );
  }

  private async create() {
    const response = await this.store.create(
      mapCreateNeighborhoodPayload(this.form.getRawValue()),
    );
    return response;
  }

  private async update() {
    const cId = this.id();
    if (!cId) return;

    const response = await this.store.update(
      cId,
      mapUpdateNeighborhoodPayload(this.form.getRawValue()),
    );
    return response;
  }
}
