import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { Badge } from "primeng/badge";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-neigh-form-page",
  imports: [ReactiveFormsModule, Button, Panel, InputTextModule, Badge],
  templateUrl: "./neigh-form-page.html",
  styleUrl: "./neigh-form-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NeighFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(NeighborhoodsStore);

  readonly saving = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control("", [
      Validators.required,
      Validators.minLength(3),
    ]),
    active: this.fb.nonNullable.control(true),
    streets: this.fb.array<FormControl<string>>([this.createStreetControl()]),
  });

  get streets(): FormArray<FormControl<string>> {
    return this.form.controls.streets;
  }

  get nameControl() {
    return this.form.controls.name;
  }

  private createStreetControl(value = ""): FormControl<string> {
    return this.fb.nonNullable.control(value, [
      Validators.required,
      Validators.minLength(2),
    ]);
  }

  addStreet(): void {
    this.streets.push(this.createStreetControl());
  }

  removeStreet(index: number): void {
    if (this.streets.length > 1) {
      this.streets.removeAt(index);
    } else {
      this.streets.at(0).setValue("");
    }
  }

  cancel(): void {
    this.router.navigate(["/neighborhoods"]);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    const { name, active, streets } = this.form.getRawValue();
    console.log("active:", active);
    const response = await this.store.create({
      name,
      streets,
    });

    if (response) {
      console.log("response");
    }
  }
}
