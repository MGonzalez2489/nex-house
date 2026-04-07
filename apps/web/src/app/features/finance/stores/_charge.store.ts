import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import {
  ApiPaginationMeta,
  Search,
  SearchCharges,
} from '@nex-house/interfaces';
import {
  ChargeCancelModel,
  ChargeConfirmModel,
  ChargeModel,
  ChargeSummaryModel,
} from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ContextStore } from '@stores/context.store';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { ChargesService } from '../services';

const config = entityConfig({
  entity: type<ChargeModel>(),
  collection: 'charges',
  selectId: (charge: ChargeModel) => charge.publicId,
});

interface FeeScheduleState {
  chargesSummary: ChargeSummaryModel | undefined;
  chargesFilters: Search | undefined;
  chargesPagination: ApiPaginationMeta | undefined;
}
const initialState: FeeScheduleState = {
  chargesSummary: undefined,
  chargesFilters: undefined,
  chargesPagination: undefined,
};

export function withChargeFeature() {
  return signalStoreFeature(
    withState(initialState),
    withEntities(config),
    withCallState(),
    withProps(() => ({
      _contextStore: inject(ContextStore),
      _chargesService: inject(ChargesService),
    })),
    withMethods((store) => ({
      chargesLoadAll: rxMethod<SearchCharges>(
        pipe(
          tap(() => patchState(store, setLoading())),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) return [];

            return store._chargesService.getAll(nId, params).pipe(
              tapResponse({
                next: (response) =>
                  patchState(
                    store,
                    setAllEntities(response.data, config),
                    {
                      chargesFilters: params,
                      chargesPagination: response.meta,
                    },
                    setLoaded(),
                  ),
                error: (err: Error) => patchState(store, setError(err)),
              }),
            );
          }),
        ),
      ),
      chargesLoadSummary: rxMethod<SearchCharges>(
        pipe(
          tap(() => patchState(store, setLoading())),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) return [];

            return store._chargesService.getSummary(nId, params).pipe(
              tapResponse({
                next: (response) =>
                  patchState(
                    store,
                    { chargesSummary: response.data },
                    setLoaded(),
                  ),
                error: (err: Error) => patchState(store, setError(err)),
              }),
            );
          }),
        ),
      ),
      confirm: async (publicId: string, dto: ChargeConfirmModel) => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading());
        try {
          const response = await lastValueFrom(
            store._chargesService.confirm(publicId, nId, dto),
          );

          patchState(
            store,
            updateEntity({ id: publicId, changes: response.data }, config),
            setLoaded(),
          );
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
      cancel: async (publicId: string, dto: ChargeCancelModel) => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading());
        try {
          const response = await lastValueFrom(
            store._chargesService.cancel(publicId, nId, dto),
          );

          patchState(
            store,
            updateEntity({ id: publicId, changes: response.data }, config),
            setLoaded(),
          );
          return true;
        } catch (error) {
          patchState(store, setError(error));
          return false;
        }
      },
    })),
  );
}
