import type { AccountResponse } from '../app/features/accounts/models/accounts.models';
import type { ClientResponse } from '../app/features/clients/models/clients.models';
import type { MovementResponse } from '../app/features/movements/models/movements.models';
import type { ReportResponse } from '../app/features/reports/models/report.models';
import type { ClientUpsertRequest } from '../app/features/clients/models/clients.models';
import type { AccountUpsertRequest } from '../app/features/accounts/models/accounts.models';
import type { MovementCreateRequest } from '../app/features/movements/models/movements.models';

export const VALID_CLIENT_FORM = {
  nombre: 'Juan Perez',
  genero: 'MASCULINO' as const,
  edad: '31',
  identificacion: 'ABC12345',
  direccion: 'Av. Siempre Viva 123',
  telefono: '+593987654321',
  contrasena: 'Clave1234',
  estado: true
};

export const VALID_ACCOUNT_FORM = {
  clienteId: '10',
  numeroCuenta: '1234567890',
  tipoCuenta: 'AHORROS' as const,
  saldoInicial: '250.50',
  estado: true
};

export const VALID_MOVEMENT_FORM = {
  cuentaId: '10',
  tipoMovimiento: 'CREDIT' as const,
  valor: '125.75'
};

export const CLIENT_RESPONSE_FIXTURE: ClientResponse = {
  id: 1,
  nombre: 'Cliente Demo',
  genero: 'MASCULINO',
  edad: 34,
  identificacion: 'ID123456',
  direccion: 'Quito',
  telefono: '0999999999',
  estado: true
};

export const ACCOUNT_RESPONSE_FIXTURE: AccountResponse = {
  id: 1,
  nombreCliente: 'Cliente Demo',
  numeroCuenta: '1234567890',
  tipoCuenta: 'AHORROS',
  saldoInicial: 120,
  estado: true
};

export const MOVEMENT_RESPONSE_FIXTURE: MovementResponse = {
  id: 1,
  numeroCuenta: '1234567890',
  fecha: '2026-01-01T00:00:00Z',
  tipoMovimiento: 'CREDIT',
  valor: 50,
  saldo: 170
};

/** Lista mixta para probar totales de creditos/debitos */
export const MOVEMENT_LIST_FIXTURE: MovementResponse[] = [
  { id: 1, numeroCuenta: '1234567890', fecha: '2026-01-01T00:00:00Z', tipoMovimiento: 'CREDIT', valor: 200, saldo: 320 },
  { id: 2, numeroCuenta: '1234567890', fecha: '2026-01-02T00:00:00Z', tipoMovimiento: 'CREDIT', valor: 150, saldo: 470 },
  { id: 3, numeroCuenta: '1234567890', fecha: '2026-01-03T00:00:00Z', tipoMovimiento: 'DEBIT', valor: 80, saldo: 390 },
  { id: 4, numeroCuenta: '1234567890', fecha: '2026-01-04T00:00:00Z', tipoMovimiento: 'DEBIT', valor: 120, saldo: 270 }
];

export const REPORT_RESPONSE_FIXTURE: ReportResponse = {
  clienteId: 1,
  fechaDesde: '2026-01-01',
  fechaHasta: '2026-01-31',
  resumen: { totalCreditos: 350, totalDebitos: 200 },
  items: [
    {
      fecha: '2026-01-15T00:00:00Z',
      cliente: 'Juan Perez',
      numeroCuenta: '1234567890',
      tipo: 'CREDIT',
      saldoInicial: 120,
      estado: true,
      movimiento: 200,
      saldoDisponible: 320
    }
  ]
};

/** Payloads tipados de API para tests de servicios */
export const CLIENT_UPSERT_PAYLOAD: ClientUpsertRequest = {
  nombre: 'Juan Perez',
  genero: 'MASCULINO',
  edad: 31,
  identificacion: 'ABC12345',
  direccion: 'Av. Siempre Viva 123',
  telefono: '+593987654321',
  contrasena: 'Clave1234',
  estado: true
};

export const ACCOUNT_UPSERT_PAYLOAD: AccountUpsertRequest = {
  clienteId: 10,
  numeroCuenta: '1234567890',
  tipoCuenta: 'AHORROS',
  saldoInicial: 250.5,
  estado: true
};

export const MOVEMENT_CREATE_PAYLOAD: MovementCreateRequest = {
  cuentaId: 10,
  tipoMovimiento: 'CREDIT',
  valor: 125.75
};
