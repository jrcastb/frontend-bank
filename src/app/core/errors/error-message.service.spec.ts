import { TestBed } from '@angular/core/testing';
import { ErrorMessageService } from './error-message.service';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorMessageService);
  });

  it('starts with null error', () => {
    expect(service.currentError()).toBeNull();
  });

  it('stores title and message with setError', () => {
    service.setError({ title: 'Error', message: 'Algo salio mal.' });

    expect(service.currentError()).toEqual({ title: 'Error', message: 'Algo salio mal.' });
  });

  it('stores optional fields (status, code, detail, traceId)', () => {
    service.setError({
      title: 'Not Found',
      message: 'Recurso no encontrado.',
      status: 404,
      code: 'CLIENT_NOT_FOUND',
      detail: 'El cliente con id 99 no existe.',
      traceId: 'abc-123'
    });

    const err = service.currentError();

    expect(err?.status).toBe(404);
    expect(err?.code).toBe('CLIENT_NOT_FOUND');
    expect(err?.detail).toBe('El cliente con id 99 no existe.');
    expect(err?.traceId).toBe('abc-123');
  });

  it('overwrites the previous error on consecutive setError calls', () => {
    service.setError({ title: 'Primero', message: 'Primer error.' });
    service.setError({ title: 'Segundo', message: 'Segundo error.' });

    expect(service.currentError()?.title).toBe('Segundo');
  });

  it('clears the error with clear()', () => {
    service.setError({ title: 'T', message: 'M' });
    service.clear();

    expect(service.currentError()).toBeNull();
  });
});
