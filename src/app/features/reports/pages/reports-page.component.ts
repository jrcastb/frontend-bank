import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportsApiService } from '../services/reports-api.service';
import type { ReportFilter, ReportResponse } from '../models/report.models';
import { downloadPdfBlob } from '../../../shared/utils/pdf-download.util';

interface ReportFormValue {
  clienteId: string;
  fechaDesde: string;
  fechaHasta: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPageComponent {
  private readonly reportsApi = inject(ReportsApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = signal<ReportFormValue>({
    clienteId: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  protected readonly loadingJson = signal(false);
  protected readonly loadingPdf = signal(false);
  protected readonly formError = signal('');
  protected readonly reportResult = signal<ReportResponse | null>(null);

  protected readonly isDateRangeValid = computed(() => {
    const { fechaDesde, fechaHasta } = this.form();

    if (!fechaDesde || !fechaHasta) {
      return true;
    }

    return fechaDesde <= fechaHasta;
  });

  protected readonly canSubmit = computed(() => {
    const { clienteId, fechaDesde, fechaHasta } = this.form();
    const hasRequiredFields = Boolean(clienteId && fechaDesde && fechaHasta);
    return hasRequiredFields && this.isDateRangeValid();
  });

  protected readonly hasResult = computed(() => this.reportResult() !== null);

  protected updateClienteId(value: string): void {
    this.form.update((currentValue) => ({
      ...currentValue,
      clienteId: value
    }));
  }

  protected updateFechaDesde(value: string): void {
    this.form.update((currentValue) => ({
      ...currentValue,
      fechaDesde: value
    }));
  }

  protected updateFechaHasta(value: string): void {
    this.form.update((currentValue) => ({
      ...currentValue,
      fechaHasta: value
    }));
  }

  protected generateJsonReport(): void {
    const filter = this.toFilter();

    if (!filter) {
      return;
    }

    this.loadingJson.set(true);
    this.formError.set('');

    this.reportsApi
      .getReportJson(filter)
      .pipe(
        finalize(() => this.loadingJson.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((report) => {
        this.reportResult.set(report);
      });
  }

  protected downloadPdfReport(): void {
    const filter = this.toFilter();

    if (!filter) {
      return;
    }

    this.loadingPdf.set(true);
    this.formError.set('');

    this.reportsApi
      .getReportPdf(filter)
      .pipe(
        finalize(() => this.loadingPdf.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response.body) {
          downloadPdfBlob(response.body, response.headers.get('content-disposition'));
        }
      });
  }

  private toFilter(): ReportFilter | null {
    if (!this.canSubmit()) {
      this.formError.set('Completa los campos requeridos y valida el rango de fechas.');
      return null;
    }

    const rawClienteId = this.form().clienteId;
    const clienteId = Number(rawClienteId);

    if (Number.isNaN(clienteId) || clienteId <= 0) {
      this.formError.set('Cliente ID debe ser un numero positivo.');
      return null;
    }

    return {
      clienteId,
      fechaDesde: this.form().fechaDesde,
      fechaHasta: this.form().fechaHasta
    };
  }
}
