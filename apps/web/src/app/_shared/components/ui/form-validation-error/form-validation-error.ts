import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ERROR_MESSAGES } from './error-messages';

@Component({
  selector: 'app-form-validation-error',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShowErrors()) {
      <div class="flex flex-column gap-1 mt-1">
        @for (error of errorMessages(); track $index) {
          <small class="p-error block animate-fade-in text-xs text-red-500">
            {{ error }}
          </small>
        }
      </div>
    }
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class FormValidationError {
  readonly errors = input.required<ValidationErrors | null>();
  readonly touched = input.required<boolean>();
  readonly label = input<string>('Field');

  protected readonly shouldShowErrors = computed(
    () => !!this.errors() && this.touched(),
  );

  protected readonly errorMessages = computed(() => {
    const errs = this.errors();
    if (!errs) return [];

    const labelText = this.label();

    return Object.entries(errs).map(([key, value]) => {
      const config = ERROR_MESSAGES[key];
      return config
        ? config(labelText, value)
        : `${labelText}: Invalid field (${key})`;
    });
  });
}
