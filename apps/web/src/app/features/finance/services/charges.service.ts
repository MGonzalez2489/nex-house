import { Injectable, inject } from '@angular/core';
import { RequestService } from '@core/services';
import { ApiResponse, SearchCharges } from '@nex-house/interfaces';
import {
  ChargeCancelModel,
  ChargeConfirmModel,
  ChargeModel,
  ChargeSummaryModel,
} from '@nex-house/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChargesService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';

  getSummary(
    neighborhood: string,
    dto: SearchCharges,
  ): Observable<ApiResponse<ChargeSummaryModel>> {
    return this.request.get<ChargeSummaryModel>(
      `${this.buildUrl(neighborhood)}/summary`,
      dto,
    );
  }

  getAll(
    neighborhood: string,
    dto: SearchCharges,
  ): Observable<ApiResponse<ChargeModel[]>> {
    return this.request.get<ChargeModel[]>(
      `${this.buildUrl(neighborhood)}`,
      dto,
    );
  }

  confirm(chargeId: string, neighborhoodId: string, dto: ChargeConfirmModel) {
    return this.request.post<ChargeModel>(
      `${this.buildUrl(neighborhoodId)}/${chargeId}/confirm`,
      dto,
    );
  }

  cancel(chargeId: string, neighborhoodId: string, dto: ChargeCancelModel) {
    return this.request.post<ChargeModel>(
      `${this.buildUrl(neighborhoodId)}/${chargeId}/cancel`,
      dto,
    );
  }

  private buildUrl(neighborhood: string) {
    return `${this.endpoint}/${neighborhood}/charges`;
  }
}
