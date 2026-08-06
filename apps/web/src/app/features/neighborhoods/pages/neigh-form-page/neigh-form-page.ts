import {
  ChangeDetectionStrategy,
  Component,
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
} from "@angular/forms";
import { Router } from "@angular/router";
import { NEIGHBORHOOD_ROUTES_ENUM } from "@neighborhoods/neighborhood.routes";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import {
  CreateNeighStreet,
  UpdateNeighborhood,
  UpdateNeighStreet,
} from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { FormOptions } from "@shared/components/forms";
import { Badge } from "primeng/badge";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { ToggleSwitchModule } from "primeng/toggleswitch";

@Component({
  selector: "app-neigh-form-page",
  imports: [
    ReactiveFormsModule,
    Button,
    Panel,
    InputTextModule,
    Badge,
    ToggleSwitchModule,
    FormOptions,
  ],
  templateUrl: "./neigh-form-page.html",
  styleUrl: "./neigh-form-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(NeighborhoodsStore);

  readonly id = input<string>();
  readonly neighborhood = signal<NeighborhoodModel | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control("", [
      Validators.required,
      Validators.minLength(3),
    ]),
    firstAdminEmail: this.fb.nonNullable.control("", [
      Validators.required,
      Validators.email,
    ]),
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

  private createStreetFormGroup(street?: CreateNeighStreet): FormGroup<{
    name: FormControl<string>;
    publicId: FormControl<string | null>;
  }> {
    return this.fb.nonNullable.group({
      name: this.fb.nonNullable.control(street?.name || "", [
        Validators.required,
        Validators.minLength(2),
      ]),
      publicId: this.fb.nonNullable.control<string | null>(
        street?.publicId || null,
      ),
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
    if (this.form.invalid) {
      return;
    }

    const response = this.id() ? await this.update() : await this.create();

    if (response) {
      this.router.navigateByUrl(`/${NEIGHBORHOOD_ROUTES_ENUM.HOME}`);
    }
  }

  private initForCreate() {
    this.addStreet();
  }
  private async initForUpdate(id: string) {
    const cN = await this.store.findById(id);
    if (!cN) return;

    this.form.patchValue({
      name: cN.name,
      active: cN.isActive,
    });

    while (this.streets.length !== 0) {
      this.streets.removeAt(0);
    }

    for (const street of cN.streets) {
      this.streets.push(this.createStreetFormGroup(street));
    }

    if (cN.streets.length === 0) {
      this.streets.push(this.createStreetFormGroup());
    }
  }

  private async create() {
    const { name, active, streets, firstAdminEmail } = this.form.getRawValue();
    const response = await this.store.create({
      name,
      adminEmail: firstAdminEmail,
      streets: streets.map((streetFormValue) => {
        return { name: streetFormValue.name };
      }),
      isActive: active,
    });
    return response;
  }

  private async update() {
    const cId = this.id();
    if (!cId) return;

    const { name, active, streets } = this.form.getRawValue();

    // Map the form values to CreateNeighStreet, conditionally including publicId
    const fStreets: UpdateNeighStreet[] = streets.map((streetFormValue) => {
      const newStreet: UpdateNeighStreet = {
        name: streetFormValue.name,
      };
      // Only include publicId if it exists (for existing streets)
      if (streetFormValue.publicId) {
        newStreet.publicId = streetFormValue.publicId;
      }
      return newStreet;
    });

    const payload: UpdateNeighborhood = {
      name,
      isActive: active,
      streets: fStreets, // Use the mapped streets array
    };

    const response = await this.store.update(cId, payload);
    return response;
  }
}
