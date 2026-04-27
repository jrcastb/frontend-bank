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

### Desde donde ejecutar docker compose

Ejecuta los comandos desde esta carpeta del frontend:

```bash
cd frontend-bank
docker compose up --build -d
```

El archivo usado es `docker-compose.yml` de este repositorio.

### Levantar stack completo con Docker (frontend + backend + mysql)

Construye y levanta todo en un solo comando:

```bash
docker compose up --build -d
```

Archivo de variables recomendado:

- Copia `.env.example` a `.env` y ajusta solo si lo necesitas.
- Este repositorio ya ignora `.env` en git.

URLs resultantes:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`

El frontend se sirve con Nginx y hace proxy de `'/api/*'` al backend dentro de la red Docker.

Valores por defecto de integracion:

- `BACKEND_URL=http://backend-bank:8080`
- `MYSQL_DATABASE=backend_bank`
- `MYSQL_USER=backend_user`
- `MYSQL_PASSWORD=backend_pass`

Por defecto, el backend se construye desde la carpeta hermana `../backend-bank`.
Si tu backend esta en otra ruta, sobreescribe el contexto:

```bash
BACKEND_CONTEXT=../mi-backend docker compose up --build -d
```

Para ver logs y detener:

```bash
docker compose logs -f frontend
docker compose down
```

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

### Notas Docker en Linux

- El flujo por defecto usa red interna Docker entre servicios, sin depender de `host.docker.internal`.

