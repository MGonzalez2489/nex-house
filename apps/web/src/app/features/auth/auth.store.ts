import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { APP_CONSTANTS } from '@core/constants';
import { environment } from '@envs/environment';
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
import { AuthService } from './services';

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
        console.log('error', error);
        patchState(store, setError(error));
        return false;
      }
    },
    passRecovery: async (email: string): Promise<string> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(
          store._authService.passwordRecovery(email),
        );

        patchState(store, setLoaded());

        if (environment.production) {
          return '';
        }

        return res.data;
      } catch (error) {
        console.log('error', error);
        patchState(store, setError(error));
        return '';
      }
    },
    validateCode: async (code: string): Promise<boolean> => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(store._authService.validateCode(code));

        patchState(store, { recoveryToken: res.data }, setLoaded());

        return true;
      } catch (error) {
        console.log('error', error);
        patchState(store, setError(error));
        return false;
      }
    },
    setNewPassword: async (newPassword: string) => {
      patchState(store, setLoading());
      try {
        const res = await lastValueFrom(
          store._authService.newPassword(store.recoveryToken()!, newPassword),
        );

        localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, res.data.token);
        localStorage.setItem(APP_CONSTANTS.TOKEN_EXP, res.data.exp.toString());
        patchState(
          store,
          {
            token: res.data.token,
            user: res.data.user,
            exp: res.data.exp,
            recoveryToken: undefined,
          },
          setLoaded(),
        );
        return true;
      } catch (error) {
        console.log('error', error);
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
      store.resetState();
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
