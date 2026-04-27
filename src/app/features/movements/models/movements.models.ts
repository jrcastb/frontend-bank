export type MovementType = 'CREDIT' | 'DEBIT';

export interface MovementResponse {
  id: number;
  numeroCuenta: string;
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
