import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { AuthStore } from '@features/auth';
import { ApiPaginationMeta, SearchTransaction } from '@nex-house/interfaces';
import { TransactionKpiModel, TransactionModel } from '@nex-house/models';
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
  entityConfig,
  prependEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ContextStore } from '@stores/context.store';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { TransactionService } from '../services';

const collection = 'transactions';
//TODO: move this to other folder
export type GroupedTransactionList = {
  date: string;
  transactions: TransactionModel[];
};

const config = entityConfig({
  entity: type<TransactionModel>(),
  collection,
  selectId: (fee: TransactionModel) => fee.publicId,
});

interface TransactionState {
  transactionsSummary: TransactionKpiModel | undefined;
  transactionsFilters: SearchTransaction | undefined;
  transactionsPagination: ApiPaginationMeta | undefined;
}
const initialState: TransactionState = {
  transactionsSummary: undefined,
  transactionsFilters: undefined,
  transactionsPagination: undefined,
};

export function withTransactionsFeature() {
  return signalStoreFeature(
    withState(initialState),
    withEntities(config),
    withReset(),
    withCallState({ collection }),
    withProps(() => ({
      _contextStore: inject(ContextStore),
      _transactionService: inject(TransactionService),
    })),
    withComputed((store) => ({
      /**
       * Agrupa transacciones por fecha optimizado para performance (O(n)).
       * Usa un Map para evitar búsquedas lineales dentro del loop.
       */
      transactionsByDate: computed<GroupedTransactionList[]>(() => {
        const groupsMap = new Map<string, TransactionModel[]>();

        store.transactionsEntities().forEach((t) => {
          const date = new Date(t.transactionDate).toDateString();
          const current = groupsMap.get(date) || [];
          current.push(t);
          groupsMap.set(date, current);
        });

        // Convertimos el Map a nuestro tipo GroupedList y ordenamos por fecha DESC
        return Array.from(groupsMap, ([date, transactions]) => ({
          date,
          transactions,
        })).sort((a, b) => b.date.localeCompare(a.date));
      }),
    })),
    withMethods((store) => ({
      transactionsLoadAll: rxMethod<SearchTransaction>(
        pipe(
          tap(() => patchState(store, setLoading(collection))),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) return [];

            return store._transactionService.getAll(nId, params).pipe(
              tapResponse({
                next: (response) =>
                  patchState(
                    store,
                    setAllEntities(response.data, config),
                    {
                      transactionsFilters: params,
                      transactionsPagination: response.meta,
                    },
                    setLoaded(collection),
                  ),
                error: (err: Error) =>
                  patchState(store, setError(err, collection)),
              }),
            );
          }),
        ),
      ),

      transactionsKpi: rxMethod<SearchTransaction>(
        pipe(
          tap(() => patchState(store, setLoading(collection))),
          switchMap((params) => {
            const nId = store._contextStore.selectedId();
            if (!nId) return [];

            return store._transactionService
              .getSummary(nId, Number(params.month), Number(params.year))
              .pipe(
                tapResponse({
                  next: (response) =>
                    patchState(
                      store,
                      {
                        transactionsSummary: response.data,
                      },
                      setLoaded(collection),
                    ),
                  error: (err: Error) =>
                    patchState(store, setError(err, collection)),
                }),
              );
          }),
        ),
      ),
    })),
    withMethods((store) => ({
      TransactionCreate: async (dto: FormData): Promise<boolean> => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading(collection));
        try {
          const response = await lastValueFrom(
            store._transactionService.create(nId, dto),
          );
          patchState(
            store,
            prependEntity(response.data, config),
            setLoaded(collection),
          );
          const cFilters = store.transactionsFilters();
          if (cFilters) {
            store.transactionsKpi(cFilters);
          }

          return true;
        } catch (err) {
          patchState(store, setError(err, collection));
          return false;
        }
      },
      TransactionRemove: async (id: string) => {
        const nId = store._contextStore.selectedId();
        if (!nId) return false;

        patchState(store, setLoading(collection));
        try {
          const response = await lastValueFrom(
            store._transactionService.remove(nId, id),
          );
          const { original, reverse } = response.data;
          patchState(
            store,
            updateEntity({ id, changes: original }, config),
            prependEntity(reverse, config),
            setLoaded(collection),
          );
          const cFilters = store.transactionsFilters();
          if (cFilters) {
            store.transactionsKpi(cFilters);
          }

          return true;
        } catch (err) {
          patchState(store, setError(err, collection));
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
            }
          });
        },
      };
    }),
  );
}
