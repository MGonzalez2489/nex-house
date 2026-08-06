import { CallState } from "@angular-architects/ngrx-toolkit";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Button, ButtonSeverity } from "primeng/button";
import { FormFeedback } from "../form-feedback/form-feedback";

@Component({
  selector: "app-form-options",
  imports: [Button, FormFeedback],
  templateUrl: "./form-options.html",
  styleUrl: "./form-options.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormOptions {
  //general props
  readonly callState = input.required<CallState>();
  readonly isLoading = input<boolean>(false);

  //submit options
  readonly submitLabel = input<string>("Guardar");
  readonly submitSeverity = input<ButtonSeverity>("primary");
  readonly submitVariant = input<"outlined" | "text" | undefined>(undefined);
  readonly submitFullWidth = input<boolean>(false);

  //cancel options
  readonly doCancel = output<boolean>();
  readonly showCancel = input<boolean>(true);
  readonly cancelLabel = input<string>("Cancelar");
  readonly cancelVariant = input<"outlined" | "text" | undefined>("outlined");
}
