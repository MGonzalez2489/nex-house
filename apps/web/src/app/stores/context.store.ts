import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
  withReset,
} from "@angular-architects/ngrx-toolkit";
import { effect, inject } from "@angular/core";
import { NeighborhoodService } from "@neighborhoods/services";
import {
  NeighborhoodModel,
  NeighStreetModel,
} from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { AuthStore } from "@auth/store";

interface contextState {
  selectedId: string | undefined;
  neighborhood: NeighborhoodModel | undefined;
  streets: NeighStreetModel[];
}

const initialState: contextState = {
  selectedId: undefined,
  neighborhood: undefined,
  streets: [],
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

    loadStreets: async () => {
      patchState(store, setLoading());
      try {
        const response = await lastValueFrom(store._neighService.getStreets());

        patchState(store, { streets: response.data }, setLoaded());
        return response.data;
      } catch (error) {
        patchState(store, setError(error));
        return undefined;
      }
    },
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
