import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { ProfileInfoForm, ProfileUnit } from "@user/components";
import { UserStore } from "@user/user.store";

@Component({
  selector: "app-profile-home-page",
  imports: [ProfileInfoForm, ProfileUnit],
  templateUrl: "./profile-home-page.html",
  styleUrl: "./profile-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHomePage {
  protected readonly store = inject(UserStore);

  user = computed(() => this.store.user());
  profile = computed(() => this.store.profile());
}
