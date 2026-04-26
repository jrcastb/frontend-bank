import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountsApiService } from './accounts-api.service';
import {
  ACCOUNT_RESPONSE_FIXTURE,
  ACCOUNT_UPSERT_PAYLOAD
} from '../../../../testing/form-test.constants';

describe('AccountsApiService', () => {
  let service: AccountsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AccountsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll realiza GET /cuentas y retorna array', () => {
    let result: typeof ACCOUNT_RESPONSE_FIXTURE[] | undefined;

    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/cuentas');
    expect(req.request.method).toBe('GET');
    req.flush([ACCOUNT_RESPONSE_FIXTURE]);

    expect(result).toEqual([ACCOUNT_RESPONSE_FIXTURE]);
  });

  it('create realiza POST /cuentas con el payload correcto', () => {
    let result: typeof ACCOUNT_RESPONSE_FIXTURE | undefined;

    service.create(ACCOUNT_UPSERT_PAYLOAD).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/cuentas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(ACCOUNT_UPSERT_PAYLOAD);
    req.flush(ACCOUNT_RESPONSE_FIXTURE);

    expect(result).toEqual(ACCOUNT_RESPONSE_FIXTURE);
  });

  it('update realiza PUT /cuentas/:id con el payload correcto', () => {
    service.update(1, ACCOUNT_UPSERT_PAYLOAD).subscribe();

    const req = httpMock.expectOne('/cuentas/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(ACCOUNT_UPSERT_PAYLOAD);
    req.flush(ACCOUNT_RESPONSE_FIXTURE);
  });

  it('patch realiza PATCH /cuentas/:id con campos parciales', () => {
    const partial = { estado: false };

    service.patch(1, partial).subscribe();

    const req = httpMock.expectOne('/cuentas/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(partial);
    req.flush(ACCOUNT_RESPONSE_FIXTURE);
  });

  it('delete realiza DELETE /cuentas/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/cuentas/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
