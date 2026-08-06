import { CallState } from "@angular-architects/ngrx-toolkit";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { MessageModule } from "primeng/message";

@Component({
  selector: "app-form-feedback",
  imports: [MessageModule],
  templateUrl: "./form-feedback.html",
  styleUrl: "./form-feedback.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFeedback {
  callState = input.required<CallState>();

  protected errorMessage = computed(() => {
    const state = this.callState();
    return typeof state === "object" && state !== null ? state.error : null;
  });
}
