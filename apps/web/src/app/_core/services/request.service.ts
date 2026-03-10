import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@nex-house/interfaces';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: unknown): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, {
      params: this.objectToQueryParameter(params),
    });
  }

  post<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(url, body);
  }

  put<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(url, body);
  }

  patch<T>(url: string, body: object): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(url, body);
  }

  delete<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url);
  }

  private objectToQueryParameter(obj: any): HttpParams {
    let params: HttpParams = new HttpParams();
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        if (element !== undefined) {
          if (Array.isArray(element)) {
            element.forEach((item: any) => {
              if (item !== undefined) {
                params = params.append(key, item);
              }
            });
          } else {
            params = params.set(key, element);
          }
        }
      }
    }
    return params;
  }
}
