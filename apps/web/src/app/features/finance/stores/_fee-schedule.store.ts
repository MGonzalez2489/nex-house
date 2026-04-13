import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { AuthStore } from '@features/auth';
import {
  ApiPaginationMeta,
  ICreateFeeSchedule,
  Search,
} from '@nex-house/interfaces';
import { FeeScheduleModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
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
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ContextStore } from '@stores/context.store';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { FeeScheduleService } from '../services';

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
    withCallState({ collection: 'feeSchedules' }),
    withReset(),
    withProps(() => ({
      _contextStore: inject(ContextStore),
      _feeScheduleService: inject(FeeScheduleService),
    })),
    withComputed((store) => ({
      feeScheduleExists: computed(() => {
        if (store.feeSchedulesLoading()) {
          return false;
        }
        return (store.feesSchedulePagination()?.total || 0) > 0;
      }),
    })),
    withMethods((store) => ({
      feeScheduleLoadAll: rxMethod<Search>(
        pipe(
          tap(() => patchState(store, setLoading('feeSchedules'))),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) {
              patchState(store, setLoading('feeSchedules'));
              return [];
            }

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
                    setLoaded('feeSchedules'),
                  ),
                error: (err: Error) =>
                  patchState(store, setError(err, 'feeSchedules')),
              }),
            );
          }),
        ),
      ),
    })),
    withMethods((store) => ({
      feeScheduleCreate: async (dto: ICreateFeeSchedule): Promise<boolean> => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading('feeSchedules'));
        try {
          const response = await lastValueFrom(
            store._feeScheduleService.create(nId, dto),
          );
          patchState(
            store,
            addEntity(response.data, config),
            setLoaded('feeSchedules'),
          );
          store.feeScheduleLoadAll(store.feesFilters()!);
          return true;
        } catch (err) {
          patchState(store, setError(err, 'feeSchedules'));
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

            if (!store.feesSchedulePagination()) {
              store.feeScheduleLoadAll({
                first: 0,
                rows: 10,
              });
            }
          });
        },
      };
    }),
  );
}
