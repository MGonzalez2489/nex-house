import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { FileUploadModule } from "primeng/fileupload";

@Component({
  selector: "app-avatar-upload-component",
  imports: [FileUploadModule],
  templateUrl: "./avatar-upload-component.html",
  styleUrl: "./avatar-upload-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarUploadComponent {
  readonly avatar = input<string>();
  readonly neighId = input.required<string>();
  readonly editable = input<boolean>(false);
  readonly refresh = output();

  protected readonly avatarUrl = computed<string>(() => {
    const cAvatar = this.avatar();
    if (cAvatar && cAvatar !== "") {
      return cAvatar;
    }

    return "avatar.webp";
  });

  readonly url = computed(() => {
    return `api/neighborhoods/${this.neighId()}/users/avatar`;
  });

  onBasicUploadAuto(): void {
    this.refresh.emit();
  }
}
