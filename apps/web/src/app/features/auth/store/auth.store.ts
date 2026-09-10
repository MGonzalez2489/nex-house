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
  recoveryToken: string | undefined;
  exp: number;
}

const initialState: AuthState = {
  token: localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY),
  recoveryToken: undefined,
  exp: (() => {
    const cExp = localStorage.getItem(APP_CONSTANTS.TOKEN_EXP);
    if (!cExp) return 0;
    return Number(cExp);
  })(),
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
  withComputed(({token}) => ({
    isAuthenticated: computed(() => !!token()),
  })),
  withMethods((store) => ({
    loadSession: (newSession: SessionModel) => {
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
      localStorage.clear();
      store.resetState();
      patchState(store, {token: null, exp: 0});
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
          console.log('error', error);
          patchState(store, setError(error));
          return false;
        }
      },

      logout: async () => {
        patchState(store, setLoading());
        try {
          // await lastValueFrom(store._authService.logout());
          store.clearSession();
        } catch (error) {
          console.log('error', error);
          patchState(store, setError(error));
          return undefined;
        }
      },
    };
  }),
);
