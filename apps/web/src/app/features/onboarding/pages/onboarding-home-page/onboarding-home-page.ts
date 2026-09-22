import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import {SessionService} from '@core/services';
import {ProfileEditPayload} from '@core/models/profile-edit-payload';
import {OnboardingStepEnum} from '@nexhouse/shared-domain/enums';
import {ChangePassword, CreateUnit} from '@nexhouse/shared-domain/interfaces';
import {OnboardingStore} from '@onboarding/onboarding.store';
import {BrandComponent} from '@shared/components';
import {Button} from '@openng/optimus-ui/button';
import {ProgressBarModule} from '@openng/optimus-ui/progressbar';
import {StepperModule} from '@openng/optimus-ui/stepper';
import {
  OnboardingFinishComponent,
  OnboardingGeneralComponent,
  OnboardingPwdChangeComponent,
  OnboardingUnitComponent,
  OnboardingWelcomeComponent,
} from '../../components';
import {ContextStore} from '@stores/context.store';
import {CatalogsStore} from '@stores/catalogs.store';
import {Router} from '@angular/router';
import {DASHBOARD_ROUTES_ENUM} from '@dashboard/dashboard.routes';
import {UserStore} from '@user/user.store';

@Component({
  selector: 'app-onboarding-home-page',
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
  templateUrl: './onboarding-home-page.html',
  styleUrl: './onboarding-home-page.css',
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

protected currentStepId = linkedSignal(() => this.store.currentStepId());
  protected readonly steps = linkedSignal(() => this.store.steps());

  protected readonly activeStepIndex = computed(() => {
    const index = this.steps().findIndex((s) => s.id === this.currentStepId());
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
  protected async updateProfile(dto?: ProfileEditPayload) {
    if (dto) {
      // ProfileFormComponent#preparePayload only includes the fields that
      // changed, so an empty payload means the data already exists and is
      // unchanged: advance without hitting the server.
      const hasChanges = Object.keys(dto).length > 0;
      if (!hasChanges) {
        this.goNext();
        return;
      }
      await this.store.updateProfile(dto);
      this.userStore.loadProfile();
    } else {
      this.goNext();
    }
  }
  protected async createUnit(dto?: CreateUnit) {
    if (dto) {
      // The user already has a unit assigned (e.g. revisiting the step), so
      // advancing without sending a request avoids a duplicate creation.
      if (this.userStore.units().length > 0) {
        this.goNext();
        return;
      }
      await this.store.createUnit(dto);
      await this.userStore.loadUser();
    } else {
      this.goNext();
    }
  }
  protected async completeOnboarding() {
    const completed = await this.store.complete();
    if (completed) {
      this.router.navigateByUrl(`/${DASHBOARD_ROUTES_ENUM.HOME}`);
    }
  }

  protected goBack() {
    const cIndex = this.activeStepIndex();
    const prevIndex = cIndex - 1;
    const prevItem = this.steps()[prevIndex];
    if (prevItem) {
      this.currentStepId.set(prevItem.id);
    }
  }
  protected goNext() {
    const cIndex = this.activeStepIndex();
    const nextIndex = cIndex + 1;
    const nextItem = this.steps()[nextIndex];
    if (nextItem) {
      this.currentStepId.set(nextItem.id);
    }
  }
}
