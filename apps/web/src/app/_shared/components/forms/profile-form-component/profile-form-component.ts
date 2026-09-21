import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
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
import { FileModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { InputMaskModule } from "@openng/optimus-ui/inputmask";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { FormValidationErrorComponent } from "../form-validation-error/form-validation-error";

import { toSignal } from "@angular/core/rxjs-interop";
import { Button } from "@openng/optimus-ui/button";
import { FileUploadModule } from "@openng/optimus-ui/fileupload";
import { FileUploadDirective } from "@shared/directives";

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
  ],
  templateUrl: "./profile-form-component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./profile-form-component.css",
})
export class ProfileFormComponent {
  profile = input<UserProfileModel>();
  doSubmit = output<FormData>();
  disabledForm = input<boolean>(false);

  protected readonly previewUrl = signal<string | null>(null);
  private currentObjectUrl: string | null = null;
  private readonly destroyRef = inject(DestroyRef);

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
      const cFile = this.formChanges()?.avatar;
      this.setPreviewUrl(
        cFile instanceof File ? URL.createObjectURL(cFile) : null,
      );
    });

    this.destroyRef.onDestroy(() => {
      if (this.currentObjectUrl) URL.revokeObjectURL(this.currentObjectUrl);
    });

    effect(async () => {
      const cProfile = this.profile();
      if (!cProfile) return;

      this.form.patchValue({
        firstName: cProfile.firstName,
        lastName: cProfile.lastName,
        phone: cProfile.phone,
      });

      if (cProfile.avatar) {
        const f = await this.urlToFile(cProfile.avatar);
        this.form.patchValue({ avatar: f });
      }
    });

    effect(() => {
      const cDisabled = this.disabledForm();
      if (cDisabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const formData = this.preparePayload(this.profile());

    this.doSubmit.emit(formData);
  }

  private preparePayload(ex?: UserProfileModel): FormData {
    const raw = this.form.getRawValue();
    const formData = new FormData();

    // Helper that appends only if changed or new
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appendIfChanged = (key: string, value: any, original?: any) => {
      if (!ex || value !== original) {
        formData.append(
          key,
          value instanceof Date ? value.toISOString() : String(value),
        );
      }
    };

    appendIfChanged("firstName", raw.firstName, ex?.firstName);
    appendIfChanged("lastName", raw.lastName, ex?.lastName);
    appendIfChanged("phone", raw.phone, ex?.phone);
    if (raw.avatar instanceof File && this.form.controls.avatar.dirty) {
      formData.append("avatar", raw.avatar, raw.avatar.name);
    }

    return formData;
  }

  async urlToFile(avatar: FileModel): Promise<File> {
    const response = await fetch(avatar.url);
    const blob = await response.blob();

    return new File([blob], avatar.originalName, {
      type: avatar.mimeType,
      lastModified: new Date(avatar.createdAt!).getTime(),
    });
  }
}
