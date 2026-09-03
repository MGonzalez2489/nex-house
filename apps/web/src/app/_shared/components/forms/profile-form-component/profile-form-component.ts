import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserProfileModel } from "@nexhouse/shared-domain/models";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { FormValidationErrorComponent } from "../form-validation-error/form-validation-error";

import { JsonPipe } from "@angular/common";
import { FileUploadDirective } from "@shared/directives";
import { Button } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-profile-form-component",
  imports: [
    FileUploadDirective,
    InputTextModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    InputMaskModule,
    FileUploadModule,
    Button,
    JsonPipe,
  ],
  templateUrl: "./profile-form-component.html",
  styleUrl: "./profile-form-component.css",
})
export class ProfileFormComponent {
  profile = input<UserProfileModel>();
  doSubmit = output<FormData>();

  protected avatarPreview = signal<string | null>(null);
  protected readonly previewUrl = computed(() => {
    const file = this.formChanges()?.avatar;
    if (!file) return null;

    const value = URL.createObjectURL(file as File);
    return value;
    // return file?.ObjectURL;
    // return file instanceof File ? URL.createObjectURL(file) : null;
  });

  protected readonly form = new FormGroup({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl(""),
    avatar: new FormControl<unknown>(null),
    phone: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  protected formChanges = toSignal(this.form.valueChanges);

  constructor() {
    effect(() => {
      const cProfile = this.profile();
      if (!cProfile) return;

      this.form.patchValue({
        firstName: cProfile.firstName,
        lastName: cProfile.lastName,
        phone: cProfile.phone,
      });
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const formData = new FormData();
    const { firstName, lastName, avatar, phone } = this.form.value;

    if (firstName) formData.append("firstName", firstName);
    if (lastName) formData.append("lastName", lastName);
    if (phone) formData.append("phone", phone);

    if (avatar instanceof File) {
      formData.append("avatar", avatar, avatar.name);
    }

    this.doSubmit.emit(formData);
  }
}
