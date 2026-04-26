import { HttpErrorResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMessageService } from '../errors/error-message.service';

const DEFAULT_TITLE = 'Error de comunicacion';
const DEFAULT_MESSAGE = 'No fue posible procesar la solicitud. Intenta nuevamente.';

interface BackendErrorPayload {
  status?: number;
  code?: string;
  title?: string;
  message?: string;
  detail?: string;
  traceId?: string;
}

function getStatusFallbackMessage(status: number): string {
  if (status === 401) {
    return 'Credenciales invalidas o ausentes.';
  }

  if (status === 422) {
    return 'No se pudo completar la operacion por una regla de negocio.';
  }

  if (status === 409) {
    return 'Conflicto detectado al procesar la solicitud.';
  }

  if (status === 404) {
    return 'No se encontro el recurso solicitado.';
  }

  if (status === 400) {
    return 'Solicitud invalida. Revisa los datos enviados.';
  }

  return DEFAULT_MESSAGE;
}

function toBackendPayload(value: unknown): BackendErrorPayload | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as BackendErrorPayload;
}

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(ErrorMessageService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const payload = toBackendPayload(error.error);
        const status = payload?.status ?? error.status;
        const title = payload?.title || DEFAULT_TITLE;
        const message = payload?.message || getStatusFallbackMessage(status);

        errorService.setError({
          title,
          message,
          status,
          code: payload?.code,
          detail: payload?.detail,
          traceId: payload?.traceId
        });
      } else {
        errorService.setError({
          title: DEFAULT_TITLE,
          message: DEFAULT_MESSAGE
        });
      }

      return throwError(() => error);
    })
  );
};
