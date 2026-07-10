/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "@nexhouse/shared-domain/interfaces";

@Injectable({ providedIn: "root" })
export class RequestService {
  private readonly http = inject(HttpClient);

  get<T>(
    url: string,
    params?: unknown,
    headers?: HttpHeaders,
  ): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, {
      params: this.objectToQueryParameter(params),
      headers: headers,
    });
  }

  post<T>(
    url: string,
    body: object,
    headers?: HttpHeaders,
    options?: { withCredentials: boolean | undefined },
  ): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(url, body, { headers, ...options });
  }

  put<T>(
    url: string,
    body: object,
    headers?: HttpHeaders,
  ): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(url, body, { headers });
  }

  patch<T>(
    url: string,
    body: object,
    headers?: HttpHeaders,
  ): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(url, body, { headers });
  }

  delete<T>(url: string, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url, { headers });
  }

  private objectToQueryParameter(obj: any): HttpParams {
    let params: HttpParams = new HttpParams();
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        if (element !== undefined && element !== null && element !== "") {
          if (Array.isArray(element)) {
            element.forEach((item: any) => {
              if (item !== undefined && item !== null) {
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
