import {
  withDevtools,
  withReset,
  withCallState,
  setError,
  setLoading,
  setLoaded,
} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { ProfileService } from "@core/services";
import { ChangePassword, UpdateUser } from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
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
}

const initialState: ProfileState = {
  user: undefined,
};

export const ProfileStore = signalStore(
  { providedIn: "root" },
  withDevtools("profile"),
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

        patchState(store, { user: res.data }, setLoaded());

        return res.data;
      } catch (error) {
        patchState(store, setError(error));
        return null;
      }
    },
    changePassword: async (dto: ChangePassword): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._service.changePassword(dto),
        );
        const cUser = store.user();

        if (!cUser) return false;

        cUser.requirePwdChange = response.data;
        patchState(store, { user: cUser }, setLoaded());

        return response.data;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    update: async (dto: UpdateUser) => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(store._service.update(dto));

        patchState(store, { user: response.data }, setLoaded());

        return response.data;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
