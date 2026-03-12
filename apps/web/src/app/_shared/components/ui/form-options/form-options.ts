import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { FormFeedback } from '../form-feedback/form-feedback';
import { CallState } from '@angular-architects/ngrx-toolkit';

@Component({
  selector: 'app-form-options',
  imports: [ButtonModule, FormFeedback],
  templateUrl: './form-options.html',
  styleUrl: './form-options.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormOptions {
  readonly callState = input.required<CallState>();

  readonly doCancel = output<boolean>();
  readonly isLoading = input<boolean>(false);

  //options customization
  readonly showCancel = input<boolean>(true);
  readonly cancelLabel = input<string>('Cancelar');
  readonly cancelVariant = input<'outlined' | 'text' | undefined>('outlined');

  readonly submitLabel = input<string>('Guardar');
  readonly submitSeverity = input<ButtonSeverity>('primary');
  readonly submitVariant = input<'outlined' | 'text' | undefined>(undefined);
}
