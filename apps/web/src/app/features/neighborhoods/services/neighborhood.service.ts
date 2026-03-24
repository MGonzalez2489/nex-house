import { inject, Injectable } from '@angular/core';
import { RequestService } from '@core/services';
import {
  ApiResponse,
  ICreateNeighborhood,
  Search,
} from '@nex-house/interfaces';
import { NeighborhoodModel } from '@nex-house/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NeighborhoodService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';

  getAll(dto: Search): Observable<ApiResponse<NeighborhoodModel[]>> {
    return this.request.get<NeighborhoodModel[]>(this.endpoint, dto);
  }

  getById(id: string): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.get<NeighborhoodModel>(`${this.endpoint}/${id}`);
  }

  create(
    dto: Partial<ICreateNeighborhood>,
  ): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.post<NeighborhoodModel>(this.endpoint, dto);
  }

  update(
    id: string,
    dto: ICreateNeighborhood,
  ): Observable<ApiResponse<NeighborhoodModel>> {
    return this.request.patch<NeighborhoodModel>(`${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
