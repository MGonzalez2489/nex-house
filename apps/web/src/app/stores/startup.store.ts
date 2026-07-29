import { withDevtools, withReset } from "@angular-architects/ngrx-toolkit";
import { effect, inject } from "@angular/core";
import { AuthStore } from "@auth/store";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { ContextStore } from "./context.store";

export type StartupStatus =
  | "IDLE"
  | "LOADING"
  | "READY"
  | "ERROR"
  | "UNAUTHENTICATED";

export interface StartupState {
  status: StartupStatus;
  error: string | null;
}

export const StartupStore = signalStore(
  { providedIn: "root" },
  withDevtools("startup"),
  withReset(),
  withProps(() => ({
    _authStore: inject(AuthStore),
    _contextStore: inject(ContextStore),
  })),
  withState<StartupState>({
    status: "IDLE",
    error: null,
  }),
  withMethods((store) => ({
    setReady() {
      patchState(store, { status: "READY", error: null });
    },
    _finalizeInit() {
      setTimeout(() => {
        patchState(store, { status: "READY", error: null });
      }, 1000);
    },
  })),

  withMethods((store) => ({
    async initializeApp() {
      if (!store._authStore.token()) {
        return;
      }

      patchState(store, { status: "LOADING" });

      try {
        const user = await store._authStore.restoreSession();

        if (!user) {
          patchState(store, { status: "UNAUTHENTICATED" });
          store._authStore.logout();
          return;
        }

        if (user.role.name !== UserRoleEnum.SUPERADMIN) {
          await store._contextStore.loadNeighborhood();
        }
        store._finalizeInit();
        // store.setReady();
      } catch (err) {
        console.error("== APP INITIALIZATION FAILED ==", err);
        patchState(store, {
          status: "ERROR",
          error: "No se pudo cargar la configuración inicial",
        });
      }
    },
  })),

  withHooks((store) => {
    return {
      onInit: (): void => {
        effect(() => {
          const usr = store._authStore.user();

          if (usr) {
            store.setReady();
          }
        });
      },
    };
  }),
);
