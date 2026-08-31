import { JsonPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { SessionService } from "@core/services";
import { ChangePassword, UpdateUser } from "@nexhouse/shared-domain/interfaces";
import { BrandComponent } from "@shared/components";
import { FormFeedback } from "@shared/components/forms/form-feedback/form-feedback";
import { UserStore } from "@stores/user.store";
import { Button } from "primeng/button";
import { ProgressBarModule } from "primeng/progressbar";
import { StepperModule } from "primeng/stepper";
import {
  OnboardingFinishComponent,
  OnboardingGeneralComponent,
  OnboardingPwdChangeComponent,
  OnboardingUnitComponent,
  OnboardingWelcomeComponent,
} from "../../components";

type onboardingStep = {
  id: number;
  name: string;
  enabled: boolean;
};

@Component({
  selector: "app-onboarding-home-page",
  imports: [
    StepperModule,
    ProgressBarModule,
    BrandComponent,
    OnboardingWelcomeComponent,
    OnboardingPwdChangeComponent,
    OnboardingGeneralComponent,
    OnboardingUnitComponent,
    OnboardingFinishComponent,
    FormFeedback,
    Button,
    JsonPipe,
  ],
  templateUrl: "./onboarding-home-page.html",
  styleUrl: "./onboarding-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OnboardingHomePage {
  protected readonly sessionService = inject(SessionService);
  protected readonly store = inject(UserStore);
  protected readonly steps: onboardingStep[] = [
    { id: 0, name: "welcome", enabled: true },
    { id: 1, name: "security", enabled: true },
    { id: 2, name: "general-form", enabled: true },
    { id: 3, name: "unit", enabled: false },
    { id: 4, name: "thanks", enabled: true },
  ];
  protected readonly currentStepId = signal<number>(0);
  protected readonly enabledSteps = computed(() =>
    this.steps.filter((f) => f.enabled),
  );
  protected readonly currentStepProgress = computed(() => {
    const eSteps = this.enabledSteps();
    const cIndex = eSteps.findIndex((f) => f.id === this.currentStepId());
    return cIndex + 1;
  });

  protected readonly currentProgress = computed(() => {
    const totalSteps = this.enabledSteps().length;
    const cStep = this.currentStepProgress();

    return (cStep / totalSteps) * 100;
  });

  constructor() {
    effect(() => {
      const cUser = this.store.user();
      if (!cUser) return;

      if (cUser.isFirstAdmin) {
        const unitStep = this.steps.find((f) => f.id === 3);
        if (unitStep) unitStep.enabled = true;
      }
    });
  }

  move(value: number) {
    const enabledSteps = this.steps.filter((f) => f.enabled);
    const cIndex = enabledSteps.findIndex((f) => f.id === this.currentStepId());
    const nextId = value < 0 ? cIndex - 1 : cIndex + 1;

    this.currentStepId.set(enabledSteps[nextId].id);
  }

  protected async updateProfile(dto: UpdateUser) {
    const response = await this.store.update(dto);
    if (response) {
      this.currentStepId.set(3);
    }
  }
  protected async changePwd(dto: ChangePassword) {
    const response = await this.store.changePassword(dto);

    if (response) {
      this.currentStepId.set(2);
    }
  }
}
