import {
  withDevtools,
  withReset,
  withCallState,
  setError,
  setLoaded,
  setLoading,
} from "@angular-architects/ngrx-toolkit";
import { ApiPaginationMeta, Search } from "@nexhouse/shared-domain/interfaces";
import { UnitModel } from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  type,
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
import { inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ContextStore } from "@stores/context.store";
import { pipe, tap, switchMap } from "rxjs";

const config = entityConfig({
  entity: type<UnitModel>(),
  selectId: (unit: UnitModel) => unit.publicId,
});

interface UnitState {
  pagination: ApiPaginationMeta | undefined;
  // stats: Unitstate | undefined;
}
const initialState: UnitState = {
  pagination: undefined,
  // stats: undefined,
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
    loadAll: rxMethod<Search>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap((params) => {
          const nId = store._contextStore.neighborhood();
          if (!nId) return [];

          return store._service.getAll(nId.publicId, params).pipe(
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
  })),
);
