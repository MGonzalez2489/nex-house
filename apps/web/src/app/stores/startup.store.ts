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
import { CatalogsStore } from "./catalogs.store";
import { UnitStore } from "@units/units.store";
import { UserStore } from "../features/user/user.store";

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
    _userStore: inject(UserStore),
    _catalogsStore: inject(CatalogsStore),
    _unitStore: inject(UnitStore),
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
    async _initRoot() {
      await store._catalogsStore.loadRootCatalogs();
      console.log("load all related to root");
    },
    async _initAdmin() {
      await Promise.all([
        store._contextStore.loadNeighborhood(),
        store._contextStore.loadStreets(),
        store._catalogsStore.loadCatalogs(),
        store._unitStore.loadAll({ showAll: true }),
      ]);
      //
    },
  })),

  withMethods((store) => ({
    async initializeApp() {
      if (!store._authStore.token()) {
        return;
      }

      patchState(store, { status: "LOADING" });

      try {
        await Promise.all([
          store._userStore.loadUser(),
          store._userStore.loadProfile(),
        ]);

        const user = store._userStore.user();
        const role = store._userStore.role();

        if (!user || !role) {
          patchState(store, { status: "UNAUTHENTICATED" });
          store._authStore.logout();
          return;
        }

        if (role.name === UserRoleEnum.SUPERADMIN) {
          console.log("=== INIT ROOT ===");
          await store._initRoot();
        } else if (role.name === UserRoleEnum.ADMIN) {
          console.log("=== INIT ADMIN ===");
          await store._initAdmin();
        } else {
          console.log("=== INIT RESIDENT ===");
        }

        store._finalizeInit();
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
          const usr = store._userStore.user();

          if (usr) {
            store.setReady();
          }
        });
      },
    };
  }),
);
