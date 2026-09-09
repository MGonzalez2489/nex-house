import {JsonPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, effect, inject, input, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UnitTypeEnum, UserRoleEnum, UserUnitRoleEnum} from '@nexhouse/shared-domain/enums';
import {CreateUnit, CreateUser} from '@nexhouse/shared-domain/interfaces';
import {Button} from '@openng/optimus-ui/button';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {Panel} from '@openng/optimus-ui/panel';
import {Select} from '@openng/optimus-ui/select';
import {ToggleSwitch} from '@openng/optimus-ui/toggleswitch';
import {RESIDENT_ROUTES_ENUM} from '@residents/resident.routes';
import {ResidentStore} from '@residents/resident.store';
import {FormValidationErrorComponent, UnitFormComponent} from '@shared/components/forms';
import {CatalogsStore} from '@stores/catalogs.store';
import {ContextStore} from '@stores/context.store';
import {UnitStore} from '@units/units.store';
import {CreateResidentForm} from './resident-form';

@Component({
  selector: 'app-resident-form-page',
  imports: [
    ReactiveFormsModule,
    Button,
    Panel,
    InputTextModule,
    Select,
    ToggleSwitch,
    FormValidationErrorComponent,
    UnitFormComponent,
    JsonPipe,
  ],
  templateUrl: './resident-form-page.html',
  styleUrl: './resident-form-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentFormPage {
  private readonly router = inject(Router);
  protected readonly id = input();
  protected readonly catStore = inject(CatalogsStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly residentStore = inject(ResidentStore);
  protected readonly unitStore = inject(UnitStore);
  protected isNewUnit = signal<boolean>(false);
  private readonly isLoadingComplete = signal<boolean>(false);

  protected readonly form = new FormGroup<CreateResidentForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    userRoleId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    unitId: new FormControl('', {
      nonNullable: true,
    }),
    unit: new FormControl<CreateUnit | null>(null, [Validators.required]),
  });

  constructor() {
    effect(() => {
      const cIsLoadingComplete = this.isLoadingComplete();
      if (cIsLoadingComplete) return;

      const loaded = this.catStore.loaded();
      const streets = this.contextStore.streets();

      if (!loaded || streets.length === 0) return;

      // this.initCreate();
      this.isLoadingComplete.set(true);
    });

    effect(() => {
      const cId = this.id();
      const cIsLoadingComp = this.isLoadingComplete();
      if (!cIsLoadingComp) return;

      if (cId) {
        this.initUpdate();
      } else {
        this.initCreate();
      }
    });

    effect(() => {
      const cIsNewUnit = this.isNewUnit();
      const {unitId, unit} = this.form.controls;
      if (cIsNewUnit) {
        this.initUnitCreate();
        unit.setValidators([Validators.required]);
        unitId.setValue('');
        unitId.clearValidators();
      } else {
        unitId.setValidators([Validators.required]);
        unit.setValue(null);
        unit.clearValidators();
      }
      this.form.updateValueAndValidity();
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.value as CreateUser;
    const response = await this.residentStore.create(dto);
    if (!response) {
      return;
    }

    //TODO: update units on create
    // if (this.isNewUnit()) {
    //   this.contextStore.loadUnits();
    // }
    this.router.navigateByUrl(`/${RESIDENT_ROUTES_ENUM.HOME}`);
  }
  cancel() {
    this.router.navigate([`/${RESIDENT_ROUTES_ENUM.HOME}`]);
  }

  //private
  private initCreate() {
    const roles = this.catStore.UserRoles();

    const userRole = roles.find((f) => f.name === UserRoleEnum.RESIDENT);

    this.form.patchValue({
      userRoleId: userRole?.publicId || '',
    });
  }

  private initUpdate() {
    const rId = this.id();
    const cResident = this.residentStore.entities().find((f) => f.publicId == rId);

    if (!cResident) return;

    const userUnit = cResident.userUnits[0];
    const unit = userUnit?.unit;

    this.form.patchValue({
      email: cResident.email,
      unitId: unit?.publicId,
      userRoleId: cResident.role?.publicId,
      unit: {
        streetId: unit?.street?.publicId,
        unitTypeId: unit?.type?.publicId,
        unitIdentifier: unit?.identifier,
        unitRoleId: userUnit.userUnitRole?.publicId,
        isCurrentOccupant: userUnit.isCurrentOccupant,
      },
    });
  }

  private initUnitCreate() {
    const unitTypes = this.catStore.UnitTypes();
    const userUnitRoles = this.catStore.UserUnitRoles();
    const streets = this.contextStore.streets();

    const unitType = unitTypes.find((f) => f.name === UnitTypeEnum.HOUSE);
    const userUnitRole = userUnitRoles.find((f) => f.name === UserUnitRoleEnum.FAMILY);
    const streetId = streets[0].publicId;

    this.form.controls.unit.setValue({
      streetId: streetId,
      unitTypeId: unitType?.publicId || '',
      unitRoleId: userUnitRole?.publicId || '',
      unitIdentifier: '',
      isCurrentOccupant: true,
    });
  }
}
