import {inject, Injectable} from '@angular/core';
import {RequestService} from '@core/services';
import {
  SearchUser,
  ApiResponse,
  CreateUser,
  UserStats,
  UpdateUser,
} from '@nexhouse/shared-domain/interfaces';
import {UserModel} from '@nexhouse/shared-domain/models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResidentService {
  private readonly request = inject(RequestService);

  getAll(
    neighborhoodId: string,
    dto: SearchUser,
  ): Observable<ApiResponse<UserModel[]>> {
    return this.request.get<UserModel[]>(this.buildUrl(neighborhoodId), dto);
  }

  getById(
    neighborhoodId: string,
    id: string,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.buildUrl(neighborhoodId)}/${id}`);
  }

  create(
    neighborhoodId: string,
    dto: CreateUser,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.post<UserModel>(this.buildUrl(neighborhoodId), dto);
  }

  getStats(neighborhoodId: string): Observable<ApiResponse<UserStats>> {
    return this.request.get<UserStats>(`${this.buildUrl(neighborhoodId)}/stats`);
  }

  update(
    neighborhoodId: string,
    id: string,
    dto: UpdateUser,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.patch<UserModel>(
      `${this.buildUrl(neighborhoodId)}/${id}`,
      dto,
    );
  }

  private buildUrl(neighborhoodId: string) {
    return `/api/neighborhoods/${neighborhoodId}/residents`;
  }
}