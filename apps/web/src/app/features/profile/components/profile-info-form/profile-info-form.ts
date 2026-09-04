import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormOptions, ProfileFormComponent } from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-profile-info-form",
  imports: [
    InputTextModule,
    Panel,
    Button,
    ProfileFormComponent,
    FormOptions,
    FormsModule,
  ],
  templateUrl: "./profile-info-form.html",
  styleUrl: "./profile-info-form.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoForm {
  user = input.required<UserModel>();
  profile = input.required<UserProfileModel>();

  protected readonly mode = signal<"info" | "form">("info");
  protected readonly save = output<FormData>();

  protected changeMode() {
    const cMode = this.mode();
    if (cMode === "info") this.mode.set("form");
    else this.mode.set("info");
  }

  protected doSubmit(dto: FormData) {
    this.save.emit(dto);
  }
  protected cancel() {
    this.mode.set("info");
  }
}
