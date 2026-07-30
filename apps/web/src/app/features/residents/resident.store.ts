import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import {
  ApiPaginationMeta,
  CreateUser,
  SearchUser,
  UserStats,
} from "@nexhouse/shared-domain/interfaces";
import { UserModel } from "@nexhouse/shared-domain/models";
import { tapResponse } from "@ngrx/operators";
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  setAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ContextStore } from "@stores/context.store";
import { lastValueFrom, pipe, switchMap, tap } from "rxjs";
import { ResidentService } from "./services";

const config = entityConfig({
  entity: type<UserModel>(),
  selectId: (user: UserModel) => user.publicId,
});

interface ResidentState {
  pagination: ApiPaginationMeta | undefined;
  stats: UserStats | undefined;
}
const initialState: ResidentState = {
  pagination: undefined,
  stats: undefined,
};

export const ResidentStore = signalStore(
  { providedIn: "root" },
  withDevtools("residents"),
  withReset(),
  withEntities(config),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _residentService: inject(ResidentService),
    _contextStore: inject(ContextStore),
  })),

  withMethods((store) => ({
    loadStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap(() => {
          const nId = store._contextStore.neighborhood();
          if (!nId) return [];

          return store._residentService.getStats(nId.publicId).pipe(
            tapResponse({
              next: (response) =>
                patchState(
                  store,
                  {
                    stats: response.data,
                  },
                  setLoaded(),
                ),
              error: (err: Error) => patchState(store, setError(err)),
            }),
          );
        }),
      ),
    ),
  })),
  withMethods((store) => ({
    loadAll: rxMethod<SearchUser>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap((params) => {
          const nId = store._contextStore.neighborhood();
          if (!nId) return [];

          return store._residentService.getAll(nId.publicId, params).pipe(
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

    create: async (dto: CreateUser): Promise<boolean> => {
      const n = store._contextStore.neighborhood();
      if (!n) return false;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._residentService.create(n.publicId, dto),
        );
        patchState(store, addEntity(response.data, config), setLoaded());

        store.loadStats();
        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
