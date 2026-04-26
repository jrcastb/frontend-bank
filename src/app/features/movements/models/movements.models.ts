export type MovementType = 'CREDIT' | 'DEBIT';

export interface MovementResponse {
  id: number;
  cuentaId: number;
  fecha: string;
  tipoMovimiento: MovementType;
  valor: number;
  saldo: number;
}

export interface MovementCreateRequest {
  cuentaId: number;
  tipoMovimiento: MovementType;
  valor: number;
}
