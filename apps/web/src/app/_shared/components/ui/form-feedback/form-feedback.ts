import { CallState } from '@angular-architects/ngrx-toolkit';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-form-feedback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageModule],
  template: `
    @if (errorMessage(); as msg) {
      <p-message
        severity="error"
        class="my-4"
        closable
        icon="pi pi-exclamation-circle"
        styleClass="h-full"
        >{{ msg }}</p-message
      >
    }
  `,
})
export class FormFeedback {
  callState = input.required<CallState>();

  protected errorMessage = computed(() => {
    const state = this.callState();
    return typeof state === 'object' && state !== null ? state.error : null;
  });
}
