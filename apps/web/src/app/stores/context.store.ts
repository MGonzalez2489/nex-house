import {
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import { NeighborhoodService } from '@features/neighborhoods';
import { NeighborhoodModel } from '@nex-house/models';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

interface contextState {
  selectedId: string | null;
  neighborhood: NeighborhoodModel | undefined;
}

const initialState: contextState = {
  selectedId: null,
  neighborhood: undefined,
};

export const ContextStore = signalStore(
  { providedIn: 'root' },
  withDevtools('context'),
  withReset(),
  withCallState(),
  withState(initialState),
  withProps((store) => ({
    _neighService: inject(NeighborhoodService),
  })),
  withMethods((store) => ({
    setNeighborhoodId(id: string | null) {
      patchState(store, { selectedId: id });
    },
    removeNeighborhood() {
      patchState(store, { neighborhood: undefined }, setLoaded());
    },
    getNeighborhood: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading())),
        switchMap(() =>
          store._neighService.getById(store.selectedId()!).pipe(
            tapResponse({
              next: (response) =>
                patchState(store, { neighborhood: response.data }, setLoaded()),
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
  })),

  withHooks((store) => {
    return {
      onInit: (): void => {
        effect(() => {
          const cSelectedId = store.selectedId();
          const cNeigh = store.neighborhood();

          if (!cSelectedId) {
            store.removeNeighborhood();
            return;
          }

          if (!cNeigh) {
            store.getNeighborhood();
          }
        });
      },
    };
  }),
);
