import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserProfileModel } from "@nexhouse/shared-domain/models";
import { toSignal } from "@angular/core/rxjs-interop";
import { InputMaskModule } from "@openng/optimus-ui/inputmask";
import { InputTextModule } from "@openng/optimus-ui/inputtext";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import { FormValidationErrorComponent } from "../form-validation-error/form-validation-error";

interface ProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  avatar: FormControl<File | null>;
  phone: FormControl<string>;
}

@Component({
  selector: "app-profile-form-component",
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    FormValidationErrorComponent,
    InputMaskModule,
  ],
  templateUrl: "./profile-form-component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./profile-form-component.css",
})
export class ProfileFormComponent {
  readonly profile = input<UserProfileModel>();
  readonly doSubmit = output<ProfileEditPayload>();
  readonly disabledForm = input<boolean>(false);
  readonly resyncKey = input<number>(0);

  protected firstNameErrorId = "firstName-errors";
  protected lastNameErrorId = "lastName-errors";
  protected phoneErrorId = "phone-errors";

  protected readonly uploadedPreviewUrl = signal<string | null>(null);
  protected readonly previewUrl = computed<string | null>(() =>
    this.uploadedPreviewUrl() ?? this.profile()?.avatar?.url ?? null,
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly avatarInput =
    viewChild<ElementRef<HTMLInputElement>>("avatarInput");
  private currentObjectUrl: string | null = null;
  private lastAvatarFile: File | null = null;

  protected readonly form = new FormGroup<ProfileForm>({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl("", { nonNullable: true }),
    avatar: new FormControl<File | null>(null),
    phone: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  protected readonly formChanges = toSignal(this.form.valueChanges);

  constructor() {
    effect(() => {
      const next = this.formChanges()?.avatar;
      if (next === this.lastAvatarFile) return;

      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = null;
      }
      this.lastAvatarFile = next instanceof File ? next : null;

      if (next instanceof File) {
        this.currentObjectUrl = URL.createObjectURL(next);
        this.uploadedPreviewUrl.set(this.currentObjectUrl);
      } else {
        this.uploadedPreviewUrl.set(null);
      }
    });

    effect(() => {
      this.resyncKey();
      const cProfile = this.profile();
      this.form.patchValue({
        firstName: cProfile?.firstName ?? "",
        lastName: cProfile?.lastName ?? "",
        phone: cProfile?.phone ?? "",
        avatar: null,
      });
      this.form.controls.avatar.markAsPristine();
    });

    effect(() => {
      const cDisabled = this.disabledForm();
      if (cDisabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });

    this.destroyRef.onDestroy(() => this.revokePreviewUrl());
  }

  protected onChoose(): void {
    if (this.disabledForm()) return;
    this.avatarInput()?.nativeElement.click();
  }

  protected onAvatarInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.controls.avatar.setValue(file);
    this.form.controls.avatar.markAsDirty();
    input.value = "";
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.doSubmit.emit(this.preparePayload(this.profile()));
  }

  private preparePayload(ex?: UserProfileModel): ProfileEditPayload {
    const raw = this.form.getRawValue();
    const payload: ProfileEditPayload = {};

    if (!ex || raw.firstName !== ex.firstName) payload.firstName = raw.firstName;
    if (!ex || raw.lastName !== ex.lastName) payload.lastName = raw.lastName;
    if (!ex || raw.phone !== ex.phone) payload.phone = raw.phone;
    if (raw.avatar instanceof File && this.form.controls.avatar.dirty) {
      payload.avatar = raw.avatar;
    }

    return payload;
  }

  private revokePreviewUrl(): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.lastAvatarFile = null;
    this.uploadedPreviewUrl.set(null);
  }
}