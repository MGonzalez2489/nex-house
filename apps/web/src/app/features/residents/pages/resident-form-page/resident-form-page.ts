import {ChangeDetectionStrategy, Component, effect, inject, input, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserRoleEnum} from '@nexhouse/shared-domain/enums';
import {CreateUnit, CreateUser, UpdateUser} from '@nexhouse/shared-domain/interfaces';
import {UserModel} from '@nexhouse/shared-domain/models';
import {Button} from '@openng/optimus-ui/button';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {Panel} from '@openng/optimus-ui/panel';
import {Select} from '@openng/optimus-ui/select';
import {RESIDENT_ROUTES_ENUM} from '@residents/resident.routes';
import {ResidentStore} from '@residents/resident.store';
import {
  FormOptions,
  FormValidationErrorComponent,
  UnitFormComponent,
} from '@shared/components/forms';
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
    FormValidationErrorComponent,
    UnitFormComponent,
    FormOptions,
  ],
  templateUrl: './resident-form-page.html',
  styleUrl: './resident-form-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentFormPage {
  private readonly router = inject(Router);
  protected readonly id = input<string | undefined>();
  protected readonly catStore = inject(CatalogsStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly residentStore = inject(ResidentStore);
  protected readonly unitStore = inject(UnitStore);

  protected readonly user = signal<UserModel | undefined>(undefined);

  private originalUserRoleId: string | undefined;
  private originalUnit: CreateUnit | undefined;
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

    unit: new FormControl<CreateUnit | null>(null, [Validators.required]),
  });

  constructor() {
    effect(() => {
      if (this.isLoadingComplete()) return;

      const catalogsLoaded = this.catStore.loaded();
      const streets = this.contextStore.streets();
      if (!catalogsLoaded || streets.length === 0) return;

      this.isLoadingComplete.set(true);

      const id = this.id();
      if (id) {
        void this.initUpdate(id);
      } else {
        this.initCreate();
      }
    });

    effect(() => {
      const cUser = this.user();
      if (!cUser) return;

      this.form.controls.email.disable();
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const id = this.id();
    const ok = id
      ? await this.residentStore.update(id, this.buildUpdatePayload())
      : await this.residentStore.create(this.form.value as CreateUser);
    if (!ok) return;

    this.router.navigateByUrl(`/${RESIDENT_ROUTES_ENUM.HOME}`);
  }

  cancel() {
    this.router.navigate([`/${RESIDENT_ROUTES_ENUM.HOME}`]);
  }

  private buildUpdatePayload(): UpdateUser {
    const current = this.form.value;

    const payload: UpdateUser = {};

    if (this.originalUserRoleId !== undefined && current.userRoleId !== this.originalUserRoleId) {
      payload.userRoleId = current.userRoleId;
    }

    if (this.hasUnitChanged(this.form.controls.unit.value)) {
      payload.unit = this.form.controls.unit.value ?? undefined;
    }

    return payload;
  }

  private hasUnitChanged(current: CreateUnit | null | undefined): boolean {
    const original = this.originalUnit ?? null;

    if (!original) return !!current;
    if (!current) return true;

    if (current.unitId || original.unitId) {
      return (
        current.unitId !== original.unitId ||
        current.unitRoleId !== original.unitRoleId ||
        current.isCurrentOccupant !== original.isCurrentOccupant
      );
    }

    return (
      current.streetId !== original.streetId ||
      current.unitIdentifier !== original.unitIdentifier ||
      current.unitTypeId !== original.unitTypeId ||
      current.unitRoleId !== original.unitRoleId ||
      current.isCurrentOccupant !== original.isCurrentOccupant
    );
  }

  private initCreate(): void {
    const roles = this.catStore.UserRoles();

    const userRole = roles.find((f) => f.name === UserRoleEnum.RESIDENT);

    this.form.patchValue({
      userRoleId: userRole?.publicId || '',
    });
  }

  private async initUpdate(rId: string): Promise<void> {
    const cResident = await this.residentStore.loadById(rId);

    if (!cResident) {
      this.router.navigateByUrl(`/${RESIDENT_ROUTES_ENUM.HOME}`);
      return;
    }

    this.user.set(cResident);

    const userUnit = cResident.userUnits[0];
    const unit = userUnit?.unit;

    this.originalUserRoleId = cResident.role?.publicId;
    this.originalUnit = unit
      ? {
          unitId: unit.publicId,
          streetId: unit.street?.publicId,
          unitTypeId: unit.type?.publicId,
          unitIdentifier: unit.identifier,
          unitRoleId: userUnit.userUnitRole?.publicId,
          isCurrentOccupant: userUnit.isCurrentOccupant,
        }
      : undefined;

    this.form.patchValue({
      email: cResident.email,
      userRoleId: cResident.role?.publicId,
      unit: {
        unitId: unit?.publicId,
        streetId: unit?.street?.publicId,
        unitTypeId: unit?.type?.publicId,
        unitIdentifier: unit?.identifier,
        unitRoleId: userUnit?.userUnitRole?.publicId,
        isCurrentOccupant: userUnit?.isCurrentOccupant,
      },
    });
  }
}