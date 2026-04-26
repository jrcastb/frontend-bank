import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { MovementCreateRequest, MovementResponse } from '../models/movements.models';

@Injectable({
  providedIn: 'root'
})
export class MovementsApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<MovementResponse[]> {
    return this.http.get<MovementResponse[]>('/movimientos');
  }

  create(payload: MovementCreateRequest): Observable<MovementResponse> {
    return this.http.post<MovementResponse>('/movimientos', payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/movimientos/${id}`);
  }
}
