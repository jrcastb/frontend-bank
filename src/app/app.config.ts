import { provideBrowserGlobalErrorListeners } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { authDefaultHeadersInterceptor } from './core/interceptors/auth-default-headers.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { provideAppConfig } from './core/config/app-config.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, authDefaultHeadersInterceptor, httpErrorInterceptor])),
    provideAppConfig()
  ]
};
