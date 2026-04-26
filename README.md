# Frontend Bank SPA

SPA construida con Angular 21, TypeScript estricto y SCSS para gestionar los dominios de banca: Clientes, Cuentas, Movimientos y Reportes.

Este repositorio ya incluye el cierre de la **Fase 0**:

- Baseline de arquitectura escalable (`core`, `shared`, `features`).
- Configuracion de ambientes y `apiBaseUrl` centralizado.
- Interceptores globales para URL base y errores HTTP.
- Estado global de errores UI con signals.
- Configuracion de calidad con ESLint y Stylelint.
- Migracion de pruebas unitarias de Vitest a Jest.

## Stack tecnico

- Angular 21 (standalone + control flow moderno)
- TypeScript (strict mode)
- SCSS
- Jest + jest-preset-angular
- ESLint (angular-eslint + typescript-eslint)
- Stylelint

## Estructura base

```text
src/app/
  core/
    api/
    config/
    errors/
    guards/
    interceptors/
  shared/
    directives/
    models/
    pipes/
    ui/
    utils/
  features/
    clients/
    accounts/
    movements/
    reports/
```

## Requisitos

- Node.js 22+
- npm 11+

## Instalacion

```bash
npm install
```

## Ejecucion local

### Frontend (modo desarrollo)

```bash
npm run start
```

### Frontend + proxy para backend local

Usa este comando cuando tu backend corre en `http://localhost:8080`:

```bash
npm run start:proxy
```

El proxy esta definido en `proxy.conf.json` y enruta `'/api'` al backend.

## Scripts de calidad

### Type checking

```bash
npm run typecheck
npm run typecheck:spec
```

### Lint TypeScript + Angular templates

```bash
npm run lint
npm run lint:fix
```

### Lint SCSS

```bash
npm run lint:styles
npm run lint:styles:fix
```

## Pruebas unitarias (Jest)

```bash
npm test
npm run test:watch
npm run test:coverage
```

Configuracion principal:

- `jest.config.js`
- `setup-jest.ts`
- `tsconfig.spec.json`

## Configuracion de entornos

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Propiedad central de integracion:

- `apiBaseUrl`

Los interceptores construyen automaticamente URLs absolutas para requests relativos.

## Integracion con backend y Docker

### Desarrollo local

- Backend sugerido: `http://localhost:8080`
- Frontend via proxy: `http://localhost:4200`

### Contrato backend aplicado en frontend

- Seguridad: Basic Auth requerido para `/clientes`, `/cuentas`, `/movimientos`, `/reportes`.
- Credenciales locales por defecto esperadas:
  - user: `admin`
  - password: `admin123`
- Header `Authorization` se inyecta automaticamente desde el interceptor `auth-default-headers.interceptor.ts`.
- Headers por defecto JSON:
  - `Accept: application/json`
  - `Content-Type: application/json` (cuando aplica por tipo de body)

### Endpoints publicos sin auth

- `GET /actuator/health`
- `GET /v3/api-docs`
- `GET /swagger-ui.html`
- `GET /swagger-ui/**`

### Errores backend unificados

El interceptor de errores soporta payload con:

- `status`
- `code`
- `title`
- `message`
- `detail`
- `traceId`

Estos campos se normalizan en el servicio de errores UI para poder mostrarlos y trazarlos.

### PDF de reportes

Para `GET /reportes` con `formato=pdf`:

- Enviar header `Accept: application/pdf` por request especifica.
- Solicitar `responseType: 'blob'`.
- Usar utilitario `src/app/shared/utils/pdf-download.util.ts` para descargar usando nombre desde `Content-Disposition`.

### Enums a respetar en frontend

- Genero: `MASCULINO | FEMENINO | OTRO`
- Tipo cuenta: `AHORROS | CORRIENTE`
- Tipo movimiento: `CREDIT | DEBIT`

### Reglas de negocio criticas a reflejar en UI

- Limite diario de debito por cuenta: `1000`.
- Debito no puede superar saldo disponible.
- Cuenta inactiva no permite movimientos.
- En reportes: `fechaDesde <= fechaHasta`.

### Escenario docker-compose (siguiente fase)

Para ejecucion conjunta `frontend + backend`, se recomienda:

1. Frontend servido con Nginx (build de Angular en multi-stage).
2. `apiBaseUrl` apuntando al servicio de backend dentro de la red de Docker.
3. En Linux, si backend vive fuera de Docker y frontend dentro de Docker, usar `host.docker.internal` con `host-gateway`.

