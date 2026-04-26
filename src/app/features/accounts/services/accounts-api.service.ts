import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AccountPatchRequest, AccountResponse, AccountUpsertRequest } from '../models/accounts.models';

@Injectable({
  providedIn: 'root'
})
export class AccountsApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>('/cuentas');
  }

  create(payload: AccountUpsertRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>('/cuentas', payload);
  }

  update(id: number, payload: AccountUpsertRequest): Observable<AccountResponse> {
    return this.http.put<AccountResponse>(`/cuentas/${id}`, payload);
  }

  patch(id: number, payload: AccountPatchRequest): Observable<AccountResponse> {
    return this.http.patch<AccountResponse>(`/cuentas/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/cuentas/${id}`);
  }
}
