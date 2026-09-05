import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { ProfileService } from "@core/services";
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
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
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
    loadProfile: async () => {
      try {
        patchState(store, setLoading());
        const prof = await lastValueFrom(store._profileService.get());

        patchState(store, { profile: prof.data }, setLoaded());
      } catch (error) {
        patchState(store, setError(error));
      }
    },
    loadUser: async () => {
      patchState(store, setLoading());

      try {
        const res = await lastValueFrom(store._userService.get());

        const state = {
          status: res.data.status,
          role: res.data.role,
          units: res.data.userUnits,
        };

        const user = res.data;
        if (user.status) {
          state.status = user.status;
          delete user.status;
        }
        if (user.role) {
          state.role = user.role;
          delete user.role;
        }
        if (user.userUnits) {
          state.units = user.userUnits;
          user.userUnits = [];
        }

        patchState(
          store,
          { user, status: state.status, role: state.role, units: state.units },
          setLoaded(),
        );
      } catch (error) {
        patchState(store, setError(error));
      }
    },
    update: async (dto: FormData) => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(store._profileService.update(dto));

        patchState(store, { profile: response.data }, setLoaded());

        return response.data;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
