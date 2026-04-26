import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { HttpResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ReportFilter, ReportResponse } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportsApiService {
  private readonly http = inject(HttpClient);

  getReportJson(filter: ReportFilter): Observable<ReportResponse> {
    const params = this.toQueryParams(filter).set('formato', 'json');
    return this.http.get<ReportResponse>('/reportes', { params });
  }

  getReportPdf(filter: ReportFilter): Observable<HttpResponse<Blob>> {
    const params = this.toQueryParams(filter).set('formato', 'pdf');
    const headers = new HttpHeaders({
      Accept: 'application/pdf'
    });

    return this.http.get('/reportes', {
      params,
      headers,
      observe: 'response',
      responseType: 'blob'
    });
  }

  private toQueryParams(filter: ReportFilter): HttpParams {
    return new HttpParams({
      fromObject: {
        clienteId: String(filter.clienteId),
        fechaDesde: filter.fechaDesde,
        fechaHasta: filter.fechaHasta
      }
    });
  }
}
