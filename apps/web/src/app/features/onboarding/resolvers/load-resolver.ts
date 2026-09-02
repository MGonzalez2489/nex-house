import { inject } from "@angular/core";
import { ResolveFn, Router } from "@angular/router";
import { OnboardingStore } from "@onboarding/onboarding.store";

export const loadResolver: ResolveFn<boolean> = async (route, state) => {
  const router = inject(Router);
  const onboardingStore = inject(OnboardingStore);

  await onboardingStore.load();

  if (onboardingStore.error()) {
    alert("error loading onboarding data> " + onboardingStore.error());
    router.navigate(["/error"]);
    return false;
  }

  return true;
};
