import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProfileCard, ProfileInfoForm, ProfileUnit } from "@profile/components";
import { ProfileStore } from "@stores/profile.store";

@Component({
  selector: "app-profile-home-page",
  imports: [ProfileCard, ProfileInfoForm, ProfileUnit],
  templateUrl: "./profile-home-page.html",
  styleUrl: "./profile-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHomePage {
  protected readonly store = inject(ProfileStore);
}
