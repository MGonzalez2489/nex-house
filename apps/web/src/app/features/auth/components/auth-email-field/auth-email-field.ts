import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {IconFieldModule} from '@openng/optimus-ui/iconfield';
import {InputIconModule} from '@openng/optimus-ui/inputicon';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {FormValidationErrorComponent} from '@shared/components/forms';

@Component({
  selector: 'app-auth-email-field',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    FormValidationErrorComponent,
  ],
  templateUrl: './auth-email-field.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthEmailField {
  readonly control = input.required<FormControl<string>>();
  readonly label = input<string>('Correo Electrónico');
  readonly inputId = input<string>('email');

  protected readonly errorId = computed(() => `${this.inputId()}-errors`);
}
