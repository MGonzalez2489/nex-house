import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import { CatalogsService } from '@core/services';
import { AuthStore } from '@features/auth';
import { TransactionCategoryModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  type,
  withHooks,
  withMethods,
  withProps,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

const transactionCatKey = 'transactionCategories';
const transactionCatalogsConfig = entityConfig({
  entity: type<TransactionCategoryModel>(),
  selectId: (cat: TransactionCategoryModel) => cat.publicId,
  collection: transactionCatKey,
});

export const CatalogsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('catalogs'),
  withReset(),
  withEntities(transactionCatalogsConfig),
  withCallState(),
  withProps(() => ({
    _catService: inject(CatalogsService),
  })),
  withMethods((store) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap(() => {
          return store._catService.getTransactionCategories().pipe(
            tapResponse({
              next: (response) =>
                patchState(
                  store,
                  setAllEntities(response.data, transactionCatalogsConfig),
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
          // const id = store._contextStore.selectedId();
          const isAuth = authStore.isAuthenticated();
          //
          if (!isAuth) {
            store.resetState();
            return;
          }

          if (store.transactionCategoriesEntities().length === 0) {
            store.loadAll();
          }
        });
      },
    };
  }),
);
