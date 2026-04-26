import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ErrorMessageService } from '../errors/error-message.service';

/** Helper: lanza una peticion GET y espera que falle, retorna la promesa */
const triggerError = (http: HttpClient, url = '/test'): Promise<void> =>
  new Promise((resolve) => {
    http.get(url).subscribe({ error: () => resolve() });
  });

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorService: ErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorMessageService);
  });

  afterEach(() => httpMock.verify());

  describe('mensajes del payload backend', () => {
    it('usa el mensaje exacto del payload cuando el backend lo incluye', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(
        { message: 'El cliente no existe.', code: 'CLIENT_NOT_FOUND' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(errorService.currentError()?.message).toBe('El cliente no existe.');
    });

    it('usa el code del payload cuando esta disponible', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(
        { message: 'Error.', code: 'ACCOUNT_NOT_FOUND' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(errorService.currentError()?.code).toBe('ACCOUNT_NOT_FOUND');
    });
  });

  describe('fallback por codigo HTTP', () => {
    it('muestra mensaje de regla de negocio para 422 sin payload', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(null, { status: 422, statusText: 'Unprocessable Entity' });

      expect(errorService.currentError()?.message).toBe(
        'No se pudo completar la operacion por una regla de negocio.'
      );
    });

    it('muestra mensaje de no encontrado para 404 sin payload', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(null, { status: 404, statusText: 'Not Found' });

      expect(errorService.currentError()?.message).toBe('No se encontro el recurso solicitado.');
    });

    it('muestra mensaje de credenciales para 401', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(errorService.currentError()?.message).toBe('Credenciales invalidas o ausentes.');
    });

    it('muestra mensaje de conflicto para 409', () => {
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').flush(null, { status: 409, statusText: 'Conflict' });

      expect(errorService.currentError()?.message).toBe('Conflicto detectado al procesar la solicitud.');
    });
  });

  describe('casos de negocio criticos', () => {
    it('propaga el mensaje "Saldo insuficiente" exacto del backend (422)', () => {
      http.post('/movimientos', {}).subscribe({ error: () => {} });

      httpMock.expectOne('/movimientos').flush(
        { message: 'Saldo insuficiente.', code: 'INSUFFICIENT_BALANCE' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(errorService.currentError()?.message).toBe('Saldo insuficiente.');
    });

    it('propaga el mensaje "Cupo diario excedido" exacto del backend (422)', () => {
      http.post('/movimientos', {}).subscribe({ error: () => {} });

      httpMock.expectOne('/movimientos').flush(
        { message: 'Cupo diario excedido.', code: 'DAILY_LIMIT_EXCEEDED' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(errorService.currentError()?.message).toBe('Cupo diario excedido.');
    });

    it('propaga el mensaje "Cuenta inactiva" del backend al intentar movimiento', () => {
      http.post('/movimientos', {}).subscribe({ error: () => {} });

      httpMock.expectOne('/movimientos').flush(
        { message: 'Cuenta inactiva, no se permiten movimientos.', code: 'ACCOUNT_INACTIVE' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(errorService.currentError()?.message).toBe(
        'Cuenta inactiva, no se permiten movimientos.'
      );
    });
  });

  describe('errores no HTTP', () => {
    it('usa mensaje generico para errores que no son HttpErrorResponse', () => {
      // Forzamos un error de red (ErrorEvent) en lugar de respuesta HTTP
      http.get('/test').subscribe({ error: () => {} });

      httpMock.expectOne('/test').error(new ProgressEvent('error'));

      expect(errorService.currentError()?.message).toBeTruthy();
    });
  });
});
