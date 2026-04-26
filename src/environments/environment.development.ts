import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiBaseUrl: '/',
  auth: {
    basicUser: 'admin',
    basicPassword: 'admin123'
  }
};
