import {computed, inject} from '@angular/core';
import {APP_CONSTANTS} from '@core/constants';
import {SessionModel} from '@nexhouse/shared-domain/models';
import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@ngrx-toolkit/core';

import {Login} from '@nexhouse/shared-domain/interfaces';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {lastValueFrom} from 'rxjs';
import {AuthService} from '../services';

interface AuthState {
  token: string | null;
  exp: number;
  //pwd recovery
  recoveryCode: string | undefined;
  resetPwdToken: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY),
  exp: (() => {
    const cExp = localStorage.getItem(APP_CONSTANTS.TOKEN_EXP);
    if (!cExp) return 0;
    return Number(cExp);
  })(),
  recoveryCode: undefined,
  resetPwdToken: localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD),
};

export const AuthStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withDevtools('auth'),
  withReset(),
  withCallState(),
  withProps(() => ({
    _authService: inject(AuthService),
  })),
  withComputed(({token, exp}) => ({
    isSessionExpired: computed(() => {
      const expiration = exp();
      return !!expiration && expiration <= Date.now();
    }),
    isAuthenticated: computed(() => {
      if (!token()) return false;
      const expiration = exp();
      return !expiration || expiration > Date.now();
    }),
  })),
  withMethods((store) => ({
    loadSession: (newSession: Pick<SessionModel, 'token' | 'exp'>) => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, newSession.token);
      localStorage.setItem(APP_CONSTANTS.TOKEN_EXP, newSession.exp.toString());
      patchState(store, {
        token: newSession.token,
        exp: newSession.exp,
      });
    },
  })),
  withMethods((store) => ({
    clearSession: () => {
      localStorage.removeItem(APP_CONSTANTS.TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONSTANTS.TOKEN_EXP);
      localStorage.removeItem(APP_CONSTANTS.TOKEN_RESET_PWD);
      store.resetState();
      patchState(store, {token: null, exp: 0, resetPwdToken: null});
    },
  })),
  withMethods((store) => {
    return {
      login: async (dto: Login): Promise<boolean> => {
        try {
          patchState(store, setLoading());
          const res = await lastValueFrom(store._authService.login(dto));
          store.loadSession(res.data);
          patchState(store, setLoaded());
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
      logout: async (): Promise<boolean> => {
        patchState(store, setLoading());
        try {
          await lastValueFrom(store._authService.logout());
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        } finally {
          // The local session must always be cleared, even when the server
          // revocation fails, so the user is never left with a stale token.
          store.clearSession();
        }
      },
    };
  }),
  withMethods((store) => {
    return {
      pwdRecoveryRequest: async (email: string) => {
        try {
          patchState(store, setLoading());
          const res = await lastValueFrom(store._authService.recoveryRequest(email));
          patchState(store, {recoveryCode: res.data.code}, setLoaded());
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
      codeValidation: async (code: string) => {
        try {
          patchState(store, setLoading());
          const res = await lastValueFrom(store._authService.codeValidation(code));
          patchState(store, {resetPwdToken: res.data.token}, setLoaded());
          localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, res.data.token);

          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
      resetPwd: async (pwd: string) => {
        try {
          patchState(store, setLoading());
          const res = await lastValueFrom(store._authService.resetPwd(pwd));
          localStorage.removeItem(APP_CONSTANTS.TOKEN_RESET_PWD);
          store.loadSession(res.data);
          patchState(
            store,
            {
              resetPwdToken: null,
              recoveryCode: undefined,
            },
            setLoaded(),
          );
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
    };
  }),
);
