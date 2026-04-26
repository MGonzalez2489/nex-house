import { inject, Injectable } from '@angular/core';
import { RequestService } from '@core/services';
import {
  ApiResponse,
  ICreateTransaction,
  SearchTransaction,
} from '@nex-house/interfaces';
import { TransactionKpiModel, TransactionModel } from '@nex-house/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly request = inject(RequestService);
  private readonly endpoint = '/api/neighborhoods';
  private readonly feature = 'transactions';

  getAll(
    neighborhood: string,
    dto: SearchTransaction,
  ): Observable<ApiResponse<TransactionModel[]>> {
    return this.request.get<TransactionModel[]>(
      `${this.buildUrl(neighborhood)}`,
      dto,
    );
  }

  getSummary(
    neighborhood: string,
    month: number,
    year: number,
  ): Observable<ApiResponse<TransactionKpiModel>> {
    return this.request.get<TransactionKpiModel>(
      `${this.buildUrl(neighborhood)}/summary`,
      { month, year },
    );
  }

  create(neighborhood: string, dto: FormData) {
    return this.request.post<TransactionModel>(
      `${this.buildUrl(neighborhood)}`,
      dto,
    );
  }

  //TODO: create model for this response
  remove(neighborhood: string, id: string) {
    return this.request.delete<{
      original: TransactionModel;
      reverse: TransactionModel;
    }>(`${this.buildUrl(neighborhood)}/${id}`);
  }
  private buildUrl(neighborhood: string) {
    return `${this.endpoint}/${neighborhood}/${this.feature}`;
  }
}
