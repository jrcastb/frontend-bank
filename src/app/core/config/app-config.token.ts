import { environment } from '../../../environments/environment';
import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  isProduction: boolean;
  auth: {
    basicUser: string;
    basicPassword: string;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(): Provider {
  return {
    provide: APP_CONFIG,
    useValue: {
      apiBaseUrl: environment.apiBaseUrl,
      isProduction: environment.production,
      auth: {
        basicUser: environment.auth.basicUser,
        basicPassword: environment.auth.basicPassword
      }
    } satisfies AppConfig
  };
}

export function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
