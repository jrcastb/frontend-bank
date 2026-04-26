import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ClientPatchRequest, ClientResponse, ClientUpsertRequest } from '../models/clients.models';

@Injectable({
  providedIn: 'root'
})
export class ClientsApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>('/clientes');
  }

  create(payload: ClientUpsertRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>('/clientes', payload);
  }

  update(id: number, payload: ClientUpsertRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`/clientes/${id}`, payload);
  }

  patch(id: number, payload: ClientPatchRequest): Observable<ClientResponse> {
    return this.http.patch<ClientResponse>(`/clientes/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/clientes/${id}`);
  }
}
