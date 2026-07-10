import { inject } from "@angular/core";
import { APP_CONSTANTS } from "@core/constants";
import { SessionModel, UserModel } from "@nexhouse/shared-domain/models";
import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@angular-architects/ngrx-toolkit";

import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { AuthService } from "./services";
import { Login } from "@nexhouse/shared-domain/interfaces";
import { lastValueFrom } from "rxjs";

interface AuthState {
  user: UserModel | undefined;
  token: string | null;
  recoveryToken: string | undefined;
  exp: number;
}

const initialState: AuthState = {
  user: undefined,
  token: localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY),
  recoveryToken: undefined,
  exp: (() => {
    const cExp = localStorage.getItem(APP_CONSTANTS.TOKEN_EXP);
    if (!cExp) return 0;
    return Number(cExp);
  })(),
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withDevtools("auth"),
  withReset(),
  withCallState(),
  withProps(() => ({
    _authService: inject(AuthService),
  })),
  withMethods((store) => ({
    loadSession: (newSession: SessionModel) => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, newSession.token);
      localStorage.setItem(APP_CONSTANTS.TOKEN_EXP, newSession.exp.toString());
      patchState(
        store,
        {
          token: newSession.token,
          user: newSession.user,
          exp: newSession.exp,
        },
        setLoaded(),
      );
      // store._socketService.connect(newSession.token);
    },
  })),

  withMethods((store) => {
    return {
      login: async (dto: Login): Promise<boolean> => {
        patchState(store, setLoading());
        try {
          const res = await lastValueFrom(store._authService.login(dto));
          store.loadSession(res.data);
          return true;
        } catch (error) {
          console.log("error", error);
          patchState(store, setError(error));
          return false;
        }
      },
    };
  }),
);
