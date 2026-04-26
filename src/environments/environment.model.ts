export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  auth: {
    basicUser: string;
    basicPassword: string;
  };
}
