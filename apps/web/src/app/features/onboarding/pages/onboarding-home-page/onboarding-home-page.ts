import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { SessionService } from "@core/services";
import { OnboardingStepEnum } from "@nexhouse/shared-domain/enums";
import {
  ChangePassword,
  UpdateUserProfile,
} from "@nexhouse/shared-domain/interfaces";
import { OnboardingStepModel } from "@nexhouse/shared-domain/models";
import { OnboardingStore } from "@onboarding/onboarding.store";
import { BrandComponent } from "@shared/components";
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
import { ContextStore } from "@stores/context.store";
import { CatalogsStore } from "@stores/catalogs.store";

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
    Button,
  ],
  templateUrl: "./onboarding-home-page.html",
  styleUrl: "./onboarding-home-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OnboardingHomePage {
  protected readonly sessionService = inject(SessionService);
  protected readonly store = inject(OnboardingStore);
  protected readonly userStore = inject(UserStore);
  protected readonly contextStore = inject(ContextStore);
  protected readonly catalogsStore = inject(CatalogsStore);
  // protected readonly onboarding = signal<
  //   OnboardingStatusResponseModel | undefined
  // >(undefined); // = this.store.onboarding;
  // protected readonly steps = this.onboarding?.steps; //this.store.onboarding()?.steps || [];

  currentStepId = signal<OnboardingStepEnum>(OnboardingStepEnum.WELCOME);
  steps = signal<OnboardingStepModel[]>([]);
  // steps = computed(() => this.store.steps() || []);

  // protected readonly currentStepProgress = computed(() => {
  //   const eSteps = this.enabledSteps();
  //   const cIndex = eSteps.findIndex((f) => f.id === this.currentStepId());
  //   return cIndex + 1;
  // });

  protected activeIndex = computed(() => {
    const index = this.steps().findIndex((s) => s.id === this.currentStepId());
    return index !== -1 ? index : 0;
  });
  move(value: number) {
    console.log("value:", value);
    // const enabledSteps = this.steps.filter((f) => f.enabled);
    // const cIndex = enabledSteps.findIndex((f) => f.id === this.currentStepId());
    // const nextId = value < 0 ? cIndex - 1 : cIndex + 1;
    //
    // this.currentStepId.set(enabledSteps[nextId].id);
  }

  constructor() {
    effect(() => {
      const cStepId = this.store.currentStepId();
      this.currentStepId.set(cStepId);
      const cSteps = this.store.steps();
      this.steps.set(cSteps);
    });
  }

  protected activeStepIndex = computed(() => {
    const index = this.steps().findIndex(
      (step) => step.id === this.currentStepId(),
    );

    return index !== -1 ? index : 0;
  });

  protected async finishWelcome() {
    const wStep = this.steps().find((f) => f.id === OnboardingStepEnum.WELCOME);
    if (wStep && !wStep.completed) {
      wStep.completed = true;
    }
    this.goNext();
  }
  protected async changePwd(dto?: ChangePassword) {
    if (dto) {
      await this.store.changePassword(dto);
    } else {
      this.goNext();
    }
  }
  protected async updateProfile(dto?: UpdateUserProfile) {
    if (dto) {
      await this.store.updateProfile(dto);
    } else {
      this.goNext();
    }
    // if (response) {
    //   this.currentStepId.set(3);
    // }
  }

  protected goBack() {
    const cIndex = this.activeIndex();
    const prevIndex = cIndex - 1;
    const prevItem = this.steps()[prevIndex];
    this.currentStepId.set(prevItem.id);
  }
  protected goNext() {
    const cIndex = this.activeIndex();
    const nextIndex = cIndex + 1;
    const nextItem = this.steps()[nextIndex];
    this.currentStepId.set(nextItem.id);
  }
}
