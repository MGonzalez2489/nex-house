import { inject, Injectable } from "@angular/core";
import { RequestService } from "./request.service";
import { BaseCatalogModel } from "@nexhouse/shared-domain/models";

@Injectable({
  providedIn: "root",
})
export class CatalogsService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/catalogs";

  getUserRoles() {
    return this.request.get<BaseCatalogModel[]>(`${this.endpoint}/user_roles`);
  }
  getUserStatus() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/user_statuses`,
    );
  }
  getUserUnitRoles() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/user_unit_roles`,
    );
  }

  getUnitStatuses() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/unit_statuses`,
    );
  }
  getUnitTypes() {
    return this.request.get<BaseCatalogModel[]>(`${this.endpoint}/unit_types`);
  }

  getTransactionSources() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/transaction_sources`,
    );
  }
  getTransactionTypes() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/transaction_types`,
    );
  }

  getPaymentStatues() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/payment_statuses`,
    );
  }
  getFeeStatuses() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/fee_statuses`,
    );
  }
  getChargeStatuses() {
    return this.request.get<BaseCatalogModel[]>(
      `${this.endpoint}/payment_statuses`,
    );
  }
}
