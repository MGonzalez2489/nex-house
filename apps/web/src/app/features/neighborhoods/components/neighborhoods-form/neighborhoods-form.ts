import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICreateNeighborhood } from '@nex-house/interfaces';
import { FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { INeighborhoodsForm } from './iNeighborhoods.form';
import { NeighborhoodsStore } from '@stores/neighborhoods.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-neighborhoods-form',
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormValidationError,
  ],
  templateUrl: './neighborhoods-form.html',
  styleUrl: './neighborhoods-form.css',
})
export class NeighborhoodsForm {
  private readonly store = inject(NeighborhoodsStore);
  private readonly ref = inject(DynamicDialogRef);
  readonly form = new FormGroup<INeighborhoodsForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    slug: new FormControl<string>(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  fName = toSignal(this.form.controls.name.valueChanges);

  constructor() {
    effect(() => {
      const v = this.fName();
      if (!v || v === '') return;

      const n = v.replace(/\s+/g, '-');
      this.form.controls.slug.patchValue(n);
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload: ICreateNeighborhood = this.form.getRawValue();

    const res = await this.store.create(payload);

    if (res) {
      this.ref.close(true);
    }
  }

  doCancel() {
    this.ref.close();
  }
}
