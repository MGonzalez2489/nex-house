import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  UnitTypeEnum,
  UserRoleEnum,
  UserUnitRoleEnum,
} from "@nexhouse/shared-domain/enums";
import { CreateUser } from "@nexhouse/shared-domain/interfaces";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { ResidentStore } from "@residents/resident.store";
import { FormValidationErrorComponent } from "@shared/components/forms";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { Select } from "primeng/select";
import { ToggleSwitch } from "primeng/toggleswitch";
import { CreateResidentForm } from "./resident-form";

@Component({
  selector: "app-resident-form-page",
  imports: [
    ReactiveFormsModule,
    Button,
    Panel,
    InputTextModule,
    Select,
    ToggleSwitch,
    FormValidationErrorComponent,
  ],
  templateUrl: "./resident-form-page.html",
  styleUrl: "./resident-form-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentFormPage {
  private readonly router = inject(Router);
  protected readonly id = input();
  protected readonly catStore = inject(CatalogsStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly residentStore = inject(ResidentStore);
  protected isNewUnit = signal<boolean>(false);
  private readonly isLoadingComplete = signal<boolean>(false);

  protected readonly form = new FormGroup<CreateResidentForm>({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    userRoleId: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isCurrentOccupant: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    unitId: new FormControl("", {
      nonNullable: true,
    }),
    streetId: new FormControl("", {
      nonNullable: true,
    }),
    unitTypeId: new FormControl("", {
      nonNullable: true,
    }),
    unitIdentifier: new FormControl("", {
      nonNullable: true,
    }),

    unitRoleId: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
      const { unitId, streetId, unitTypeId, unitIdentifier } =
        this.form.controls;

      if (cIsNewUnit) {
        unitId.setValue(undefined, { emitEvent: false });
        unitId.clearValidators();

        streetId.setValidators([Validators.required]);
        unitTypeId.setValidators([Validators.required]);
        unitIdentifier.setValidators([Validators.required]);
      } else {
        unitId.setValidators([Validators.required]);
        streetId.clearValidators();
        unitTypeId.clearValidators();
        unitIdentifier.clearValidators();
      }
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

    if (this.isNewUnit()) {
      this.contextStore.loadUnits();
    }
    this.router.navigateByUrl(`/${RESIDENT_ROUTES_ENUM.HOME}`);
  }
  cancel() {
    this.router.navigate([`/${RESIDENT_ROUTES_ENUM.HOME}`]);
  }

  //private
  private initCreate() {
    const roles = this.catStore.UserRoles();
    const unitTypes = this.catStore.UnitTypes();
    const userUnitRoles = this.catStore.UserUnitRoles();
    const streets = this.contextStore.streets();

    const userRole = roles.find((f) => f.name === UserRoleEnum.RESIDENT);
    const unitType = unitTypes.find((f) => f.name === UnitTypeEnum.HOUSE);
    const userUnitRole = userUnitRoles.find(
      (f) => f.name === UserUnitRoleEnum.FAMILY,
    );

    this.form.patchValue({
      userRoleId: userRole?.publicId,
      unitTypeId: unitType?.publicId,
      unitRoleId: userUnitRole?.publicId,
      streetId: streets[0].publicId,
    });
  }

  private initUpdate() {
    const rId = this.id();
    const cResident = this.residentStore
      .entities()
      .find((f) => f.publicId == rId);

    if (!cResident) return;

    this.form.patchValue({
      email: cResident.email,
      userRoleId: cResident.role?.publicId,
      unitId: cResident.units[0]?.unit.publicId,
      unitRoleId: cResident.units[0]?.userUnitRole.publicId,
    });
  }
}
