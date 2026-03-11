import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormValidationError } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { INeighborhoodsForm } from './iNeighborhoods.form';
import { NeighborhoodStore } from '@stores/neighborhood.store';
import { ICreateNeighborhood } from '@nex-house/interfaces';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

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
  private readonly store = inject(NeighborhoodStore);
  private readonly ref = inject(DynamicDialogRef);
  readonly form = new FormGroup<INeighborhoodsForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    slug: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

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
