import { Injectable, signal } from '@angular/core';

export interface UiError {
  title: string;
  message: string;
  status?: number;
  code?: string;
  detail?: string;
  traceId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  private readonly _currentError = signal<UiError | null>(null);

  readonly currentError = this._currentError.asReadonly();

  setError(error: UiError): void {
    this._currentError.set(error);
  }

  clear(): void {
    this._currentError.set(null);
  }
}
