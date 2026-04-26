import type { HttpInterceptorFn } from '@angular/common/http';
import type { HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config.token';

const JSON_CONTENT_TYPE = 'application/json';
const JSON_ACCEPT = 'application/json';

function shouldSetJsonContentType(requestBody: unknown): boolean {
  if (requestBody === null || requestBody === undefined) {
    return false;
  }

  return !(requestBody instanceof FormData || requestBody instanceof Blob || requestBody instanceof ArrayBuffer);
}

function toBasicHeaderValue(user: string, password: string): string | null {
  if (!user || !password) {
    return null;
  }

  const rawToken = `${user}:${password}`;
  return `Basic ${btoa(rawToken)}`;
}

export const authDefaultHeadersInterceptor: HttpInterceptorFn = (request, next) => {
  const appConfig = inject(APP_CONFIG);
  let headers: HttpHeaders = request.headers;

  if (!headers.has('Accept')) {
    headers = headers.set('Accept', JSON_ACCEPT);
  }

  if (!headers.has('Content-Type') && shouldSetJsonContentType(request.body)) {
    headers = headers.set('Content-Type', JSON_CONTENT_TYPE);
  }

  if (!headers.has('Authorization')) {
    const basicHeaderValue = toBasicHeaderValue(appConfig.auth.basicUser, appConfig.auth.basicPassword);

    if (basicHeaderValue) {
      headers = headers.set('Authorization', basicHeaderValue);
    }
  }

  return next(request.clone({ headers }));
};
