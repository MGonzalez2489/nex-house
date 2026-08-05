import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { BrandComponent } from "@shared/components";
import { ProfileStore } from "@stores/profile.store";
import { ProgressBarModule } from "primeng/progressbar";
import { StepperModule } from "primeng/stepper";
import {
  OnboardingGeneralComponent,
  OnboardingPwdChangeComponent,
  OnboardingWelcomeComponent,
} from "../../components";
import { ChangePassword } from "@nexhouse/shared-domain/interfaces";

type onboardingStep = {
  order: number;
  name: string;
};

@Component({
  selector: "app-onboarding-home-page",
  imports: [
    StepperModule,
    ProgressBarModule,
    BrandComponent,
    OnboardingPwdChangeComponent,
    OnboardingWelcomeComponent,
    OnboardingGeneralComponent,
  ],
  templateUrl: "./onboarding-home-page.html",
  styleUrl: "./onboarding-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OnboardingHomePage {
  protected readonly store = inject(ProfileStore);
  protected readonly steps: onboardingStep[] = [
    { order: 0, name: "welcome" },
    { order: 1, name: "security" },
    { order: 2, name: "general-form" },
    { order: 3, name: "thanks" },
  ];
  protected readonly currentStep = signal<number>(1);

  protected readonly currentProgress = computed(() => {
    const totalSteps = this.steps.length;
    const cStep = this.currentStep() + 1;

    return (cStep / totalSteps) * 100;
  });

  move(value: number) {
    const newValue = this.currentStep() + value;
    this.currentStep.set(newValue);
  }

  protected async changePwd(dto: ChangePassword) {
    const response = await this.store.changePassword(dto);

    if (response) {
      this.currentStep.set(2);
    }
  }
}
