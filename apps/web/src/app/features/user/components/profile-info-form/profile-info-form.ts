import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { CallState } from "@ngrx-toolkit/core";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormOptions, ProfileFormComponent } from "@shared/components/forms";
import { Button } from "@openng/optimus-ui/button";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { Panel } from "@openng/optimus-ui/panel";

@Component({
  selector: "app-profile-info-form",
  imports: [
    InputTextModule,
    Panel,
    Button,
    ProfileFormComponent,
    FormOptions,
  ],
  templateUrl: "./profile-info-form.html",
  styleUrl: "./profile-info-form.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoForm {
  readonly user = input.required<UserModel>();
  readonly profile = input.required<UserProfileModel>();
  readonly isLoading = input.required<boolean>();
  readonly callState = input<CallState>();

  readonly save = output<FormData>();

  protected readonly mode = signal<"info" | "form">("info");
  private readonly savingInForm = signal(false);

  constructor() {
    effect(() => {
      const state = this.callState();
      if (this.mode() !== "form") {
        this.savingInForm.set(false);
        return;
      }
      if (state === "loading") {
        this.savingInForm.set(true);
        return;
      }
      if (this.savingInForm() && state === "loaded") {
        this.savingInForm.set(false);
        this.mode.set("info");
      }
    });
  }

  protected edit() {
    this.mode.set("form");
  }

  protected doSubmit(dto: FormData) {
    this.save.emit(dto);
  }

  protected cancel() {
    this.mode.set("info");
  }
}