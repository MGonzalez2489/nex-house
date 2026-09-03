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
import { UpdateUser } from "@nexhouse/shared-domain/interfaces";
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
    _service: inject(ProfileService),
  })),
  withMethods((store) => ({
    load: async () => {
      patchState(store, setLoading());

      try {
        const res = await lastValueFrom(store._service.get());

        const state: ProfileState = {
          user: undefined,
          profile: undefined,
          status: undefined,
          role: undefined,
          units: [],
        };

        const user = res.data;

        if (user.profile) {
          state.profile = user.profile;
          delete user.profile;
        }
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
        state.user = user;

        patchState(store, state, setLoaded());

        return state;
      } catch (error) {
        patchState(store, setError(error));
        return null;
      }
    },
    update: async (dto: FormData) => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(store._service.update(dto));

        patchState(store, { profile: response.data }, setLoaded());

        return response.data;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
