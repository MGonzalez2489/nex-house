import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
  withDevtools,
} from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { CatalogsService } from "@core/services";
import { BaseCatalogModel } from "@nexhouse/shared-domain/models";
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { firstValueFrom, lastValueFrom } from "rxjs";

export interface CatalogsState {
  UserRoles: BaseCatalogModel[];
  UserStatus: BaseCatalogModel[];
  UserUnitRoles: BaseCatalogModel[];

  UnitStatus: BaseCatalogModel[];
  UnitTypes: BaseCatalogModel[];

  TransactionSources: BaseCatalogModel[];
  TransactionTypes: BaseCatalogModel[];

  PaymentStatus: BaseCatalogModel[];
  FeeStatus: BaseCatalogModel[];
  ChargeStatus: BaseCatalogModel[];

  //
  countries: BaseCatalogModel[];
  states: BaseCatalogModel[];
  cities: BaseCatalogModel[];
}

export const CatalogsStore = signalStore(
  { providedIn: "root" },
  withDevtools("catalogs"),
  withCallState(),
  withState<CatalogsState>({
    UserRoles: [],
    UserStatus: [],
    UserUnitRoles: [],
    UnitStatus: [],
    UnitTypes: [],
    TransactionSources: [],
    TransactionTypes: [],
    PaymentStatus: [],
    FeeStatus: [],
    ChargeStatus: [],

    countries: [],
    states: [],
    cities: [],
  }),
  withProps(() => ({
    _service: inject(CatalogsService),
  })),

  withMethods((store) => ({
    async loadRootCatalogs() {
      patchState(store, setLoading());
      try {
        const c = await lastValueFrom(store._service.getCountries());
        const mex = c.data.find((f) => f.name == "mexico");
        if (!mex) {
          console.log("no hay mexico");
          throw "no hay mexico";
        }
        const s = await lastValueFrom(store._service.getStates(mex.publicId));
        const chi = s.data.find((f) => f.name === "chihuahua");
        if (!chi) {
          console.log("no hay chihuahua");
          throw "no hay chihuahua";
        }

        const cit = await lastValueFrom(store._service.getCities(chi.publicId));

        patchState(
          store,
          {
            countries: c.data,
            states: s.data,
            cities: cit.data,
          },
          setLoaded(),
        );
      } catch (e) {
        patchState(store, setError(e));
      }
    },
    async loadCatalogs() {
      patchState(store, setLoading());

      try {
        const promises = [
          firstValueFrom(store._service.getUserRoles()),
          firstValueFrom(store._service.getUserStatus()),
          firstValueFrom(store._service.getUserUnitRoles()),
          firstValueFrom(store._service.getUnitStatuses()),
          firstValueFrom(store._service.getUnitTypes()),
          firstValueFrom(store._service.getTransactionSources()),
          firstValueFrom(store._service.getTransactionTypes()),
          firstValueFrom(store._service.getPaymentStatues()),
          firstValueFrom(store._service.getFeeStatuses()),
          firstValueFrom(store._service.getChargeStatuses()),
        ];
        const [
          userRolesResponse,
          userStatusResponse,
          userUnitRolesResponse,
          unitStatusResponse,
          unitTypesResponse,
          transactionSourcesResponse,
          transactionTypesResponse,
          paymentStatusResponse,
          feeStatusResponse,
          chargeStatusResponse,
        ] = await Promise.all(promises);

        patchState(store, {
          UserRoles: userRolesResponse.data,
          UserStatus: userStatusResponse.data,
          UserUnitRoles: userUnitRolesResponse.data,
          UnitStatus: unitStatusResponse.data,
          UnitTypes: unitTypesResponse.data,
          TransactionSources: transactionSourcesResponse.data,
          TransactionTypes: transactionTypesResponse.data,
          PaymentStatus: paymentStatusResponse.data,
          FeeStatus: feeStatusResponse.data,
          ChargeStatus: chargeStatusResponse.data,
        });
        patchState(store, setLoaded());
      } catch (e) {
        patchState(store, setError(e));
      }
    },
  })),
);
