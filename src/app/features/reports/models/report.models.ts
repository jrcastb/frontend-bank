export interface ReportSummary {
  totalDebitos: number;
  totalCreditos: number;
}

export interface ReportItem {
  fecha: string;
  cliente: string;
  numeroCuenta: string;
  tipo: string;
  saldoInicial: number;
  estado: boolean;
  movimiento: number;
  saldoDisponible: number;
}

export interface ReportResponse {
  clienteId: number;
  fechaDesde: string;
  fechaHasta: string;
  resumen: ReportSummary;
  items: ReportItem[];
}

export interface ReportFilter {
  clienteId: number;
  fechaDesde: string;
  fechaHasta: string;
}
