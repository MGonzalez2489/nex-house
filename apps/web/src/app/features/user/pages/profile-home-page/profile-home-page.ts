import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { FormFeedback } from "@shared/components/forms";
import { ProfileInfoForm, ProfileUnit } from "@user/components";
import { UserStore } from "@user/user.store";

@Component({
  selector: "app-profile-home-page",
  imports: [ProfileInfoForm, ProfileUnit, FormFeedback],
  templateUrl: "./profile-home-page.html",
  styleUrl: "./profile-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHomePage {
  protected readonly store = inject(UserStore);

  protected vm = computed(() => {
    const user = this.store.user();
    const profile = this.store.profile();
    return user && profile ? { user, profile } : undefined;
  });

  protected neighborhood = computed(() => this.store.user()?.neighborhood);
}