import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { ApiResponse, ILogin } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '@features/auth';
import { APP_CONSTANTS } from '@core/constants';

interface AuthState {
  user: UserModel | undefined;
  token: string | null;
  exp: number;
}

const initialState: AuthState = {
  user: undefined,
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
    login: async (dto: ILogin): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._authService.login(dto));

        localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, res.data.token);
        localStorage.setItem(APP_CONSTANTS.TOKEN_EXP, res.data.exp.toString());
        patchState(
          store,
          {
            token: res.data.token,
            user: res.data.user,
            exp: res.data.exp,
          },
          setLoaded(),
        );
        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
    me: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() =>
          store._authService.me().pipe(
            tapResponse({
              next: (res: ApiResponse<UserModel>) => {
                patchState(
                  store,
                  {
                    user: res.data,
                  },
                  setLoaded(),
                );
              },
              error: (err: any) => {
                const errorMessage = err.error?.message || 'Identity failed';
                patchState(store, { callState: { error: errorMessage } });
              },
            }),
          ),
        ),
      ),
    ),
    logout() {
      localStorage.clear();
      localStorage.removeItem(APP_CONSTANTS.TOKEN_STORAGE_KEY);
      localStorage.removeItem(APP_CONSTANTS.TOKEN_EXP);

      patchState(store, initialState, setLoaded());
    },
  })),

  withHooks((store) => {
    return {
      onInit: (): void => {
        effect(() => {
          const cToken = store.token();
          const cUser = store.user();
          if (cToken && !cUser) {
            store.me();
          }
        });
      },
    };
  }),
);
