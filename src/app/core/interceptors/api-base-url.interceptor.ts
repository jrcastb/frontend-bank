import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG, isAbsoluteUrl } from '../config/app-config.token';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (isAbsoluteUrl(request.url)) {
    return next(request);
  }

  const { apiBaseUrl } = inject(APP_CONFIG);
  const normalizedBase = apiBaseUrl.replace(/\/$/, '');
  const normalizedUrl = request.url.startsWith('/') ? request.url : `/${request.url}`;

  return next(request.clone({ url: `${normalizedBase}${normalizedUrl}` }));
};
