import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import { NeighborhoodService } from '@features/neighborhoods';
import {
  ApiPaginationMeta,
  ICreateNeighborhood,
  Search,
} from '@nex-house/interfaces';
import { NeighborhoodModel } from '@nex-house/models';
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
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from './auth.store';

const config = entityConfig({
  entity: type<NeighborhoodModel>(),
  selectId: (neigh: NeighborhoodModel) => neigh.publicId,
});

interface Neighborhoodstate {
  pagination: ApiPaginationMeta | undefined;
}
const initialState: Neighborhoodstate = {
  pagination: undefined,
};

export const NeighborhoodsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('neighborhood'),
  withReset(),
  withEntities(config),
  withCallState(),
  withProps(() => ({
    _neighService: inject(NeighborhoodService),
  })),
  withState(initialState),
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
    create: async (dto: ICreateNeighborhood): Promise<boolean> => {
      patchState(store, setLoading());

      try {
        const res = await lastValueFrom(store._neighService.create(dto));

        patchState(store, addEntity(res.data, config), setLoaded());

        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
    update: async (id: string, dto: ICreateNeighborhood): Promise<boolean> => {
      patchState(store, setLoading());

      try {
        const res = await lastValueFrom(store._neighService.update(id, dto));

        patchState(
          store,
          updateEntity({ id, changes: res.data }, config),
          setLoaded(),
        );

        return true;
      } catch (error) {
        patchState(store, setError(error));
        return false;
      }
    },
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
