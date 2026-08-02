import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import { Search, UnitStats } from "@nexhouse/shared-domain/interfaces";
import { UnitModel } from "@nexhouse/shared-domain/models";

@Injectable({
  providedIn: "root",
})
export class UnitService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "units";

  getAll(neighId: string, filters: Search) {
    return this.request.get<UnitModel[]>(this.getEndpoint(neighId), filters);
  }

  getStats(neighId: string) {
    return this.request.get<UnitStats>(`${this.getEndpoint(neighId)}/stats`);
  }

  private getEndpoint(neighborhoodId: string): string {
    return `/api/neighborhood/${neighborhoodId}/${this.endpoint}`;
  }
}
