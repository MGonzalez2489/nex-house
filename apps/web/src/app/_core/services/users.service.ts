import { Injectable, inject } from '@angular/core';
import { ApiResponse, ICreateUser, Search } from '@nex-house/interfaces';
import { UserModel } from '@nex-house/models';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';

  getAll(
    neighborhood: string,
    dto: Search,
  ): Observable<ApiResponse<UserModel[]>> {
    return this.request.get<UserModel[]>(`${this.buildUrl(neighborhood)}`, dto);
  }

  getById(
    neighborhood: string,
    id: string,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.get<UserModel>(`${this.buildUrl(neighborhood)}/${id}`);
  }

  create(
    neighborhood: string,
    dto: ICreateUser,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.post<UserModel>(this.buildUrl(neighborhood), dto);
  }

  update(
    neighborhood: string,
    id: string,
    dto: ICreateUser,
  ): Observable<ApiResponse<UserModel>> {
    return this.request.patch<UserModel>(
      `${this.buildUrl(neighborhood)}/${id}`,
      dto,
    );
  }

  delete(neighborhood: string, id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.buildUrl(neighborhood)}/${id}`);
  }

  private buildUrl(neighborhood: string) {
    return `${this.endpoint}/${neighborhood}/users`;
  }
}
