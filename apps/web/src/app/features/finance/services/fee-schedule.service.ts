import { Injectable, inject } from '@angular/core';
import { RequestService } from '@core/services';
import { ApiResponse, ICreateFeeSchedule, Search } from '@nex-house/interfaces';
import { FeeScheduleModel } from '@nex-house/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeeScheduleService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';

  getAll(
    neighborhood: string,
    dto: Search,
  ): Observable<ApiResponse<FeeScheduleModel[]>> {
    return this.request.get<FeeScheduleModel[]>(
      `${this.buildUrl(neighborhood)}`,
      dto,
    );
  }

  getById(
    neighborhood: string,
    id: string,
  ): Observable<ApiResponse<FeeScheduleModel>> {
    return this.request.get<FeeScheduleModel>(
      `${this.buildUrl(neighborhood)}/${id}`,
    );
  }

  create(
    neighborhood: string,
    dto: ICreateFeeSchedule,
  ): Observable<ApiResponse<FeeScheduleModel>> {
    return this.request.post<FeeScheduleModel>(
      this.buildUrl(neighborhood),
      dto,
    );
  }

  update(
    neighborhood: string,
    id: string,
    dto: ICreateFeeSchedule,
  ): Observable<ApiResponse<FeeScheduleModel>> {
    return this.request.patch<FeeScheduleModel>(
      `${this.buildUrl(neighborhood)}/${id}`,
      dto,
    );
  }

  delete(neighborhood: string, id: string): Observable<ApiResponse<boolean>> {
    return this.request.delete<boolean>(`${this.buildUrl(neighborhood)}/${id}`);
  }

  private buildUrl(neighborhood: string) {
    return `${this.endpoint}/${neighborhood}/fee-schedule`;
  }
}
