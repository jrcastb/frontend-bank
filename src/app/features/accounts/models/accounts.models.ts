export type AccountType = 'AHORROS' | 'CORRIENTE';

export interface AccountResponse {
  id: number;
  nombreCliente: string;
  numeroCuenta: string;
  tipoCuenta: AccountType;
  saldoInicial: number;
  estado: boolean;
}

export interface AccountUpsertRequest {
  clienteId: number;
  numeroCuenta: string;
  tipoCuenta: AccountType;
  saldoInicial: number;
  estado: boolean;
}

export interface AccountPatchRequest {
  numeroCuenta?: string;
  tipoCuenta?: AccountType;
  saldoInicial?: number;
  estado?: boolean;
}
