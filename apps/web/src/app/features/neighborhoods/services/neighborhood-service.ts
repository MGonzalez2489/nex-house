import { inject, Injectable } from "@angular/core";
import { RequestService } from "@core/services";
import {
  ApiResponse,
  CreateNeighborhood,
  Search,
  UpdateNeighborhood,
} from "@nexhouse/shared-domain/interfaces";
import {
  NeighborhoodModel,
  NeighStreetModel,
} from "@nexhouse/shared-domain/models";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NeighborhoodService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/neighborhood";

  private readonly defaultSearch: Search = {
    rows: 10,
    showAll: true,
    first: 0,
  };

  getAll(dto: Search): Observable<ApiResponse<NeighborhoodModel[]>> {
    return this.request.get<NeighborhoodModel[]>(this.endpoint, dto);
  }

  getMine(): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.get<NeighborhoodModel>(`${this.endpoint}/mine`);
  }

  getById(id: string): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.get<NeighborhoodModel>(`${this.endpoint}/${id}`);
  }

  create(
    dto: Partial<CreateNeighborhood>,
  ): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.post<NeighborhoodModel>(this.endpoint, dto);
  }

  update(
    id: string,
    dto: UpdateNeighborhood,
  ): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.patch<NeighborhoodModel>(`${this.endpoint}/${id}`, dto);
  }

  getStreets(
    dto: Search = this.defaultSearch,
  ): Observable<ApiResponse<NeighStreetModel[]>> {
    return this.request.get<NeighStreetModel[]>(
      `${this.endpoint}/streets`,
      dto,
    );
  }
}