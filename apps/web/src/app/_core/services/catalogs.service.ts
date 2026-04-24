import { inject, Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { TransactionCategoryModel } from '@nex-house/models';

@Injectable({
  providedIn: 'root',
})
export class CatalogsService {
  private readonly request = inject(RequestService);

  getTransactionCategories() {
    return this.request.get<TransactionCategoryModel[]>(
      '/api/catalogs/categories',
    );
  }
}
