import {
  withDevtools,
  withReset,
  withCallState,
  setLoaded,
  setLoading,
  setError,
} from "@angular-architects/ngrx-toolkit";
import { inject, effect } from "@angular/core";
import { AuthStore } from "@auth/store";
import { NeighborhoodService } from "@neighborhoods/services";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { tapResponse } from "@ngrx/operators";
import {
  signalStore,
  withState,
  withProps,
  withMethods,
  patchState,
  withHooks,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { lastValueFrom, pipe, tap, switchMap } from "rxjs";

interface contextState {
  selectedId: string | undefined;
  neighborhood: NeighborhoodModel | undefined;
}

const initialState: contextState = {
  selectedId: undefined,
  neighborhood: undefined,
};

export const ContextStore = signalStore(
  { providedIn: "root" },
  withDevtools("context"),
  withReset(),
  withCallState(),
  withState(initialState),
  withProps(() => ({
    _neighService: inject(NeighborhoodService),
  })),
  withMethods((store) => ({
    setNeighborhoodId(id: string | undefined) {
      patchState(store, { selectedId: id });
    },
    removeNeighborhood() {
      patchState(store, { neighborhood: undefined }, setLoaded());
    },
    loadNeighborhood: async () => {
      patchState(store, setLoading());
      try {
        const nId = store.selectedId();

        let response;
        if (nId)
          response = await lastValueFrom(store._neighService.getById(nId));
        else {
          response = await lastValueFrom(store._neighService.getMine());
        }

        patchState(store, { neighborhood: response.data }, setLoaded());
        return response.data;
      } catch (error) {
        patchState(store, setError(error));
        return undefined;
      }
    },
  })),
);
