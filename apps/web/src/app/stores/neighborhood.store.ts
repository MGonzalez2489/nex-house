import {
  withDevtools,
  withReset,
  withCallState,
  setLoading,
  setLoaded,
} from '@angular-architects/ngrx-toolkit';
import { inject, effect } from '@angular/core';
import { ApiPaginationMeta, Search } from '@nex-house/interfaces';
import { NeighborhoodModel } from '@nex-house/models';
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
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { AuthStore } from './auth.store';
import { NeighborhoodService } from '@features/neighborhoods';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';

const config = entityConfig({
  entity: type<NeighborhoodModel>(),
  selectId: (building: NeighborhoodModel) => building.publicId,
});

export const NeighborhoodStore = signalStore(
  { providedIn: 'root' },
  withDevtools('neighborhood'),
  withReset(),
  withEntities(config),
  withCallState(),
  withProps(() => ({
    _neighService: inject(NeighborhoodService),
  })),
  withState({
    pagination: null as ApiPaginationMeta | null,
  }),
  withMethods((store) => ({
    loadAll: rxMethod<Search>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap((dto) =>
          store._neighService.getAll(dto).pipe(
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
              error: (err: any) =>
                patchState(store, {
                  callState: {
                    error: err.error?.message || 'Load buildings failed',
                  },
                }),
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          const isLoggedIn = authStore.isAuthenticated();
          if (!isLoggedIn) {
            store.resetState();
          }
        });
      },
    };
  }),
);
