import {
  withDevtools,
  withReset,
  withCallState,
  setError,
  setLoaded,
  setLoading,
} from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import {
  ApiPaginationMeta,
  IBulkCreateHousingUnit,
  ICreateHousingUnit,
  Search,
} from '@nex-house/interfaces';
import { UnitModel } from '@nex-house/models';
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { ContextStore } from './context.store';
import { UnitsService } from '@core/services';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, lastValueFrom } from 'rxjs';

const config = entityConfig({
  entity: type<UnitModel>(),
  selectId: (unit: UnitModel) => unit.publicId,
});

interface UsersState {
  pagination: ApiPaginationMeta | undefined;
  suggestions: UnitModel[];
}
const initialState: UsersState = {
  pagination: undefined,
  suggestions: [],
};

export const UnitsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('units'),
  withReset(),
  withEntities(config),
  withCallState(),
  withProps(() => ({
    _contextStore: inject(ContextStore),
    _unitsService: inject(UnitsService),
  })),
  withState(initialState),
  withMethods((store) => ({
    loadAll: rxMethod<Search>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap((params) => {
          const nId = store._contextStore.selectedId();
          if (!nId) return [];

          return store._unitsService.getAll(nId, params).pipe(
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
    searchSuggestions: rxMethod<string>(
      pipe(
        // debounceTime(300),
        // distinctUntilChanged(),
        switchMap((query) => {
          const nId = store._contextStore.selectedId();
          if (!nId || query.length < 2)
            return [patchState(store, { suggestions: [] })];

          // Usamos el mismo service, pero con params de búsqueda mínima
          return store._unitsService
            .getAll(nId, { globalFilter: query, first: 0, rows: 10 })
            .pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, { suggestions: response.data }),
                error: () => patchState(store, { suggestions: [] }),
              }),
            );
        }),
      ),
    ),
    create: async (dto: ICreateHousingUnit): Promise<boolean> => {
      const nId = store._contextStore.selectedId();
      if (!nId) return false;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._unitsService.create(nId, dto),
        );
        patchState(store, addEntity(response.data, config), setLoaded());

        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
    bulkCreate: async (dto: IBulkCreateHousingUnit): Promise<boolean> => {
      const nId = store._contextStore.selectedId();
      if (!nId) return false;

      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(
          store._unitsService.bulkCreate(nId, dto),
        );
        patchState(store, addEntities(response.data, config), setLoaded());

        return true;
      } catch (err) {
        patchState(store, setError(err));
        return false;
      }
    },
  })),
);
