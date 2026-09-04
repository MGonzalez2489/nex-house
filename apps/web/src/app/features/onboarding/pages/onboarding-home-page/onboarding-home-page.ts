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
  CreateUnit,
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
import { Router } from "@angular/router";
import { DASHBOARD_ROUTES_ENUM } from "@dashboard/dashboard.routes";

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
  private readonly router = inject(Router);
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

  // protected readonly currentStepProgress = computed(() => {
  //   const eSteps = this.enabledSteps();
  //   const cIndex = eSteps.findIndex((f) => f.id === this.currentStepId());
  //   return cIndex + 1;
  // });

  protected activeIndex = computed(() => {
    const index = this.steps().findIndex((s) => s.id === this.currentStepId());
    return index !== -1 ? index : 0;
  });

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
  protected async updateProfile(dto?: FormData) {
    if (dto) {
      await this.store.updateProfile(dto);
      this.store.load();
    } else {
      this.goNext();
    }
  }
  protected async createUnit(dto?: CreateUnit) {
    if (dto) {
      await this.store.createUnit(dto);
    } else {
      this.goNext();
    }
  }
  protected async completeOnboarding() {
    await this.store.complete();

    // this.router.resetConfig(DASHBOARD_ROUTES);
    // const urlTree = this.router.createUrlTree([
    //   `/${DASHBOARD_ROUTES_ENUM.HOME}`,
    // ]);
    this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
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
