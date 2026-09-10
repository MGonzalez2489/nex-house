import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@ngrx-toolkit/core';
import {effect, inject} from '@angular/core';
import {OnboardingStepModel} from '@nexhouse/shared-domain/models';
import {patchState, signalStore, withHooks, withMethods, withProps, withState} from '@ngrx/signals';
import {OnboardingService} from './services/onboarding-service';
import {lastValueFrom} from 'rxjs';
import {OnboardingStepEnum} from '@nexhouse/shared-domain/enums';
import {ChangePassword, CreateUnit} from '@nexhouse/shared-domain/interfaces';
import {UserStore} from '@user/user.store';
import {AuthStore} from '@auth/store';

//TODO: verify if use enum (and in OnboardingStatusResponseModel)
interface OnboardingState {
  isCompleted: boolean;
  currentStepId: OnboardingStepEnum;
  steps: OnboardingStepModel[];
}

const initialState: OnboardingState = {
  isCompleted: false,
  currentStepId: OnboardingStepEnum.WELCOME,
  steps: [],
};

export const OnboardingStore = signalStore(
  {providedIn: 'root'},
  withDevtools('onboarding'),
  withReset(),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _service: inject(OnboardingService),
    _userStore: inject(UserStore),
  })),
  withMethods((store) => ({
    load: async () => {
      try {
        patchState(store, setLoading());
        const res = await lastValueFrom(store._service.get());
        patchState(store, {...res.data}, setLoaded());
        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
    changePassword: async (dto: ChangePassword): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.changePassword(dto));
        patchState(store, {...res.data}, setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    updateProfile: async (dto: FormData): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.updateProfile(dto));
        patchState(store, {...res.data}, setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    createUnit: async (dto: CreateUnit) => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.createUnit(dto));
        patchState(store, {...res.data}, setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    complete: async () => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.complete());
        patchState(store, {...res.data});

        await store._userStore.loadUser();

        patchState(store, setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),

  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          if (!authStore.isAuthenticated()) {
            store.resetState();
          }
        });
      },
    };
  }),
);
