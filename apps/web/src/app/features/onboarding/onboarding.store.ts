import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { OnboardingStepModel } from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { OnboardingService } from "./services/onboarding-service";
import { lastValueFrom } from "rxjs";
import { OnboardingStepEnum } from "@nexhouse/shared-domain/enums";
import {
  ChangePassword,
  CreateUnit,
  UpdateUserProfile,
} from "@nexhouse/shared-domain/interfaces";
import { UserStore } from "@stores/user.store";

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
  { providedIn: "root" },
  withDevtools("onboarding"),
  withReset(),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _service: inject(OnboardingService),
    _userStore: inject(UserStore),
  })),
  withMethods((store) => ({
    load: async () => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.get());
        patchState(store, { ...res.data }, setLoaded());
      } catch (error) {
        patchState(store, setError(error));
      }
    },
    changePassword: async (dto: ChangePassword): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._service.changePassword(dto));
        patchState(store, { ...res.data }, setLoaded());
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
        patchState(store, { ...res.data }, setLoaded());
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
        patchState(store, { ...res.data }, setLoaded());
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
        patchState(store, { ...res.data });

        await store._userStore.load();

        patchState(store, setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
