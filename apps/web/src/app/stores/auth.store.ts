import {
  setLoaded,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { ApiResponse, ILogin } from '@nex-house/interfaces';
import { SessionModel, UserModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { APP_CONSTANTS } from '../_core';
import { AuthService } from '../features/auth/auth.service';

interface AuthState {
  user: UserModel | null;
  token: string | null;
  exp: number;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY),
  exp: (() => {
    const cExp = localStorage.getItem(APP_CONSTANTS.TOKEN_EXP);
    if (!cExp) return 0;
    return Number(cExp);
  })(),
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('auth'),
  withReset(),
  withCallState(),
  withProps(() => ({
    _authService: inject(AuthService),
  })),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!token() && !!user()),
    userRole: computed(() => user()?.role ?? null),
  })),
  withMethods((store) => ({
    login: rxMethod<ILogin>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((credentials) =>
          store._authService.login(credentials).pipe(
            tapResponse({
              next: (res: ApiResponse<SessionModel>) => {
                localStorage.setItem(
                  APP_CONSTANTS.TOKEN_STORAGE_KEY,
                  res.data.token,
                );
                localStorage.setItem(
                  APP_CONSTANTS.TOKEN_EXP,
                  res.data.exp.toString(),
                );
                patchState(
                  store,
                  {
                    token: res.data.token,
                    user: res.data.user,
                    exp: res.data.exp,
                  },
                  setLoaded(),
                );
              },
              error: (err: any) => {
                const errorMessage = err.error?.message || 'Login failed';
                patchState(store, { callState: { error: errorMessage } });
              },
            }),
          ),
        ),
      ),
    ),
    logout() {
      localStorage.clear();
      patchState(store, initialState, setLoaded());
    },
  })),
);
