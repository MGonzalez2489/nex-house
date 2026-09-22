import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@ngrx-toolkit/core";
import { effect, inject } from "@angular/core";
import { ProfileService } from "@core/services";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import {
  UserModel,
  UserProfileModel,
  UserRoleModel,
  UserStatusModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { AuthStore } from "@auth/store";
import { UserService } from "./services";

interface ProfileState {
  user: UserModel | undefined;
  profile: UserProfileModel | undefined;
  status: UserStatusModel | undefined;
  role: UserRoleModel | undefined;
  units: UserUnitModel[];
}

const initialState: ProfileState = {
  user: undefined,
  profile: undefined,
  status: undefined,
  role: undefined,
  units: [],
};

export const UserStore = signalStore(
  { providedIn: "root" },
  withDevtools("user"),
  withReset(),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _userService: inject(UserService),
    _profileService: inject(ProfileService),
  })),
  withMethods((store) => ({
    loadProfile: async (): Promise<boolean> => {
      try {
        patchState(store, setLoading());
        const prof = await lastValueFrom(store._profileService.get());

        patchState(store, { profile: prof.data }, setLoaded());
        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
    loadUser: async (): Promise<boolean> => {
      patchState(store, setLoading());

      try {
        const res = await lastValueFrom(store._userService.get());
        const { status, role, userUnits, ...rest } = res.data;

        patchState(
          store,
          {
            user: { ...rest, userUnits: [] },
            status,
            role,
            units: userUnits,
          },
          setLoaded(),
        );
        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
    update: async (dto: ProfileEditPayload): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(store._profileService.update(dto));

        patchState(store, { profile: response.data }, setLoaded());
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