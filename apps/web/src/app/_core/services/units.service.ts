import { Injectable, inject } from '@angular/core';
import {
  ApiResponse,
  IBulkCreateHousingUnit,
  ICreateHousingUnit,
  Search,
} from '@nex-house/interfaces';
import { UnitModel } from '@nex-house/models';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';

  getAll(
    neighborhood: string,
    dto: Search,
  ): Observable<ApiResponse<UnitModel[]>> {
    return this.request.get<UnitModel[]>(`${this.buildUrl(neighborhood)}`, dto);
  }

  getById(
    neighborhood: string,
    id: string,
  ): Observable<ApiResponse<UnitModel>> {
    return this.request.get<UnitModel>(`${this.buildUrl(neighborhood)}/${id}`);
  }

  create(
    neighborhood: string,
    dto: ICreateHousingUnit,
  ): Observable<ApiResponse<UnitModel>> {
    return this.request.post<UnitModel>(this.buildUrl(neighborhood), dto);
  }
  bulkCreate(
    neighborhood: string,
    dto: IBulkCreateHousingUnit,
  ): Observable<ApiResponse<UnitModel[]>> {
    return this.request.post<UnitModel[]>(
      `${this.buildUrl(neighborhood)}/bulk`,
      dto,
    );
  }

  update(
    neighborhood: string,
    id: string,
    dto: ICreateHousingUnit,
  ): Observable<ApiResponse<UnitModel>> {
    return this.request.patch<UnitModel>(
      `${this.buildUrl(neighborhood)}/${id}`,
      dto,
    );
  }

  delete(neighborhood: string, id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.buildUrl(neighborhood)}/${id}`);
  }

  private buildUrl(neighborhood: string) {
    return `${this.endpoint}/${neighborhood}/units`;
  }
}
