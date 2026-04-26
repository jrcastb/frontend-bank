import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovementsApiService } from './movements-api.service';
import {
  MOVEMENT_RESPONSE_FIXTURE,
  MOVEMENT_CREATE_PAYLOAD
} from '../../../../testing/form-test.constants';

describe('MovementsApiService', () => {
  let service: MovementsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(MovementsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll realiza GET /movimientos y retorna array', () => {
    let result: typeof MOVEMENT_RESPONSE_FIXTURE[] | undefined;

    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/movimientos');
    expect(req.request.method).toBe('GET');
    req.flush([MOVEMENT_RESPONSE_FIXTURE]);

    expect(result).toEqual([MOVEMENT_RESPONSE_FIXTURE]);
  });

  it('create realiza POST /movimientos con el payload correcto', () => {
    let result: typeof MOVEMENT_RESPONSE_FIXTURE | undefined;

    service.create(MOVEMENT_CREATE_PAYLOAD).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/movimientos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(MOVEMENT_CREATE_PAYLOAD);
    req.flush(MOVEMENT_RESPONSE_FIXTURE);

    expect(result).toEqual(MOVEMENT_RESPONSE_FIXTURE);
  });

  it('delete realiza DELETE /movimientos/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/movimientos/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
