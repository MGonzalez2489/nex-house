import { computed, inject, Injectable } from "@angular/core";
import { AuthStore } from "@auth/store";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  //injects
  private readonly authStore = inject(AuthStore);

  //properties
  user = computed(() => this.authStore.user());
}
