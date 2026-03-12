import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import { UsersService } from '@core/services';
import { ApiPaginationMeta, ICreateUser, Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  type,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from './auth.store';
import { ContextStore } from './context.store';

const config = entityConfig({
  entity: type<UserModel>(),
  selectId: (user: UserModel) => user.publicId,
});

interface UsersState {
  pagination: ApiPaginationMeta | undefined;
}
const initialState: UsersState = {
  pagination: undefined,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withDevtools('users'),
  withReset(),
  withEntities(config),
  withCallState(),
  withProps(() => ({
    _userService: inject(UsersService),
    _contextStore: inject(ContextStore),
  })),
  withState(initialState),
  withMethods((store) => ({
    loadAll: rxMethod<Search>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap((params) => {
          const nId = store._contextStore.selectedId();
          if (!nId) return [];

          return store._userService.getAll(nId, params).pipe(
            tapResponse({
              next: (response) =>
                patchState(
                  store,
                  setAllEntities(response.data, config),
                  {
                    pagination: response.meta,
                  },
                  setLoaded(),
                ),
              error: (err: Error) => patchState(store, setError(err)),
            }),
          );
        }),
      ),
    ),
    create: async (dto: ICreateUser): Promise<boolean> => {
      const nId = store._contextStore.selectedId();
      if (!nId) return false;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._userService.create(nId, dto),
        );
        patchState(store, addEntity(response.data, config), setLoaded());

        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    update: async (id: string, dto: ICreateUser): Promise<boolean> => {
      const nId = store._contextStore.selectedId();
      if (!nId) return false;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._userService.update(nId, id, dto),
        );
        patchState(
          store,
          updateEntity({ id, changes: response.data }, config),
          setLoaded(),
        );
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      const nId = store._contextStore.selectedId();
      if (!nId) return false;

      patchState(store, setLoading());

      try {
        await lastValueFrom(store._userService.delete(nId, id));
        patchState(store, removeEntity(id), setLoaded());
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),

  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          const id = store._contextStore.selectedId();
          const isAuth = authStore.isAuthenticated();

          if (!isAuth || !id) {
            store.resetState();
            return;
          }
        });
      },
    };
  }),
);
