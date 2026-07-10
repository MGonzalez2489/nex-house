import { inject } from "@angular/core";
import { APP_CONSTANTS } from "@core/constants";
import { UserModel } from "@nexhouse/shared-domain/models";

import { signalStore, withProps, withState } from "@ngrx/signals";
import { AuthService } from "./services";

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
  withProps(() => ({
    _authService: inject(AuthService),
  })),
);
