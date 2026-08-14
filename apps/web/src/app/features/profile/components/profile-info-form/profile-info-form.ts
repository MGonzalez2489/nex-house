import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UpdateUser } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import {
  FormOptions,
  FormValidationErrorComponent,
} from "@shared/components/forms";
import { Button } from "primeng/button";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { Panel } from "primeng/panel";

@Component({
  selector: "app-profile-info-form",
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    Panel,
    Button,
    InputMaskModule,
    FormOptions,
  ],
  templateUrl: "./profile-info-form.html",
  styleUrl: "./profile-info-form.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoForm implements OnInit {
  user = input.required<UserModel>();
  protected readonly form = new FormGroup({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl(""),
    phone: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl(""),
  });
  protected readonly mode = signal<"info" | "form">("info");
  protected readonly save = output<UpdateUser>();

  constructor() {
    effect(() => {
      const cMode = this.mode();

      if (cMode === "info") {
        this.form.controls.firstName.disable();
        this.form.controls.lastName.disable();
        this.form.controls.phone.disable();
      } else {
        this.form.controls.firstName.enable();
        this.form.controls.lastName.enable();
        this.form.controls.phone.enable();
      }
    });
  }

  ngOnInit(): void {
    this.form.controls.email.disable();
    const cUser = this.user();
    if (!cUser) return;

    this.cancel();
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const formValue = { ...this.form.value };
    if (formValue.phone) {
      formValue.phone = formValue.phone.replace(/[\D\s]/g, ""); // Remove all non-digits and whitespace
    }

    this.save.emit({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
    } as UpdateUser);

    // if (this.form.dirty) this.doSubmit.emit(formValue as UpdateUser);
    // else {
    //   this.next.emit();
    // }
  }
  cancel() {
    const user = this.user();
    this.form.reset();
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    });

    if (this.mode() !== "info") {
      this.mode.set("info");
    }
  }

  protected changeMode() {
    const cMode = this.mode();
    if (cMode === "info") this.mode.set("form");
    else this.mode.set("info");
  }
}
