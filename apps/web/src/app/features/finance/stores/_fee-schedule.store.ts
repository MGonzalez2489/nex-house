import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import {
  ApiPaginationMeta,
  ICreateFeeSchedule,
  Search,
} from '@nex-house/interfaces';
import { FeeScheduleModel } from '@nex-house/models';
import {
  patchState,
  signalStoreFeature,
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
  withEntities,
} from '@ngrx/signals/entities';
import { ContextStore } from '@stores/context.store';
import { FeeScheduleService } from '../services';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, lastValueFrom } from 'rxjs';
import { AuthStore } from '@features/auth';

const config = entityConfig({
  entity: type<FeeScheduleModel>(),
  collection: 'feeSchedules',
  selectId: (fee: FeeScheduleModel) => fee.publicId,
});

interface FeeScheduleState {
  feesFilters: Search | undefined;
  feesSchedulePagination: ApiPaginationMeta | undefined;
}
const initialState: FeeScheduleState = {
  feesFilters: undefined,
  feesSchedulePagination: undefined,
};

export function withFeeScheduleFeature() {
  return signalStoreFeature(
    withState(initialState),
    withEntities(config),
    withCallState(),
    withReset(),
    withProps(() => ({
      _contextStore: inject(ContextStore),
      _feeScheduleService: inject(FeeScheduleService),
    })),
    withMethods((store) => ({
      feeScheduleLoadAll: rxMethod<Search>(
        pipe(
          tap(() => patchState(store, setLoading())),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) return [];

            return store._feeScheduleService.getAll(nId, params).pipe(
              tapResponse({
                next: (response) =>
                  patchState(
                    store,
                    setAllEntities(response.data, config),
                    {
                      feesFilters: params,
                      feesSchedulePagination: response.meta,
                    },
                    setLoaded(),
                  ),
                error: (err: Error) => patchState(store, setError(err)),
              }),
            );
          }),
        ),
      ),
      feeScheduleCreate: async (dto: ICreateFeeSchedule): Promise<boolean> => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading());
        try {
          const response = await lastValueFrom(
            store._feeScheduleService.create(nId, dto),
          );
          patchState(store, addEntity(response.data, config), setLoaded());

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
            const isAuth = authStore.isAuthenticated();

            if (!isAuth) {
              store.resetState();
              return;
            }
          });
        },
      };
    }),
  );
}
