import type { Environment } from './environment.model';

export type { Environment };

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  auth: {
    basicUser: 'admin',
    basicPassword: 'admin123'
  }
};
