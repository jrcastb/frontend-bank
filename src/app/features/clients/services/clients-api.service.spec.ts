import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientsApiService } from './clients-api.service';
import {
  CLIENT_RESPONSE_FIXTURE,
  CLIENT_UPSERT_PAYLOAD
} from '../../../../testing/form-test.constants';

describe('ClientsApiService', () => {
  let service: ClientsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ClientsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll realiza GET /clientes y retorna array', () => {
    let result: typeof CLIENT_RESPONSE_FIXTURE[] | undefined;

    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/clientes');
    expect(req.request.method).toBe('GET');
    req.flush([CLIENT_RESPONSE_FIXTURE]);

    expect(result).toEqual([CLIENT_RESPONSE_FIXTURE]);
  });

  it('create realiza POST /clientes con el payload correcto', () => {
    let result: typeof CLIENT_RESPONSE_FIXTURE | undefined;

    service.create(CLIENT_UPSERT_PAYLOAD).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/clientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(CLIENT_UPSERT_PAYLOAD);
    req.flush(CLIENT_RESPONSE_FIXTURE);

    expect(result).toEqual(CLIENT_RESPONSE_FIXTURE);
  });

  it('update realiza PUT /clientes/:id con el payload correcto', () => {
    service.update(1, CLIENT_UPSERT_PAYLOAD).subscribe();

    const req = httpMock.expectOne('/clientes/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(CLIENT_UPSERT_PAYLOAD);
    req.flush(CLIENT_RESPONSE_FIXTURE);
  });

  it('patch realiza PATCH /clientes/:id con campos parciales', () => {
    const partial = { nombre: 'Nuevo Nombre' };

    service.patch(1, partial).subscribe();

    const req = httpMock.expectOne('/clientes/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(partial);
    req.flush(CLIENT_RESPONSE_FIXTURE);
  });

  it('delete realiza DELETE /clientes/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/clientes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
