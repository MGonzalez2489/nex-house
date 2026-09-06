import {
  withDevtools,
  withReset,
  withCallState,
  setError,
  setLoaded,
  setLoading,
} from "@angular-architects/ngrx-toolkit";
import {
  ApiPaginationMeta,
  Search,
  UnitStats,
} from "@nexhouse/shared-domain/interfaces";
import { UnitModel } from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  type,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { UnitService } from "./services";
import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ContextStore } from "@stores/context.store";
import { pipe, tap, switchMap, lastValueFrom } from "rxjs";
import { AuthStore } from "@auth/store";

const config = entityConfig({
  entity: type<UnitModel>(),
  selectId: (unit: UnitModel) => unit.publicId,
});

interface UnitState {
  pagination: ApiPaginationMeta | undefined;
  stats: UnitStats | undefined;
}
const initialState: UnitState = {
  pagination: undefined,
  stats: undefined,
};

export const UnitStore = signalStore(
  { providedIn: "root" },
  withDevtools("units"),
  withReset(),
  withEntities(config),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _service: inject(UnitService),
    _contextStore: inject(ContextStore),
  })),
  withMethods((store) => ({
    async loadAll(params: Search) {
      const nId = store._contextStore.neighborhood();
      if (!nId) return;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._service.getAll(nId.publicId, params),
        );
        patchState(
          store,
          setAllEntities(response.data, config),
          { pagination: response.meta },
          setLoaded(),
        );
      } catch (err) {
        patchState(store, setError(err));
      }
    },

    loadStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap(() => {
          const nId = store._contextStore.neighborhood();
          if (!nId) return [];

          return store._service.getStats(nId.publicId).pipe(
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
  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          if (!authStore.isAuthenticated()) {
            store.resetState();
          }
        });
      },
    };
  }),
);
