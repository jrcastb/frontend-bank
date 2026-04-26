import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MovementsApiService } from '../services/movements-api.service';
import { MovementsPageComponent } from './movements-page.component';
import {
  MOVEMENT_LIST_FIXTURE,
  MOVEMENT_RESPONSE_FIXTURE,
  VALID_MOVEMENT_FORM
} from '../../../../testing/form-test.constants';

type MovementsApiMock = {
  getAll: jest.Mock;
  create: jest.Mock;
  delete: jest.Mock;
};

type MovementsComponentTestApi = {
  form: {
    patchValue: (value: Partial<typeof VALID_MOVEMENT_FORM>) => void;
    setValue: (value: typeof VALID_MOVEMENT_FORM) => void;
  };
  pendingDeletionMovement: () => typeof MOVEMENT_RESPONSE_FIXTURE | null;
  formError: () => string;
  openCreateForm: () => void;
  requestDeleteMovement: (movement: typeof MOVEMENT_RESPONSE_FIXTURE) => void;
  closeDeleteMovementDialog: () => void;
  confirmDeleteMovement: () => void;
  submitForm: () => void;
  totalCredits: () => number;
  totalDebits: () => number;
};

describe('MovementsPageComponent', () => {
  const apiMock: MovementsApiMock = {
    getAll: jest.fn(() => of([MOVEMENT_RESPONSE_FIXTURE])),
    create: jest.fn(() => of(MOVEMENT_RESPONSE_FIXTURE)),
    delete: jest.fn(() => of(void 0))
  };

  const createComponent = (): MovementsComponentTestApi => {
    const fixture = TestBed.createComponent(MovementsPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as MovementsComponentTestApi;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MovementsPageComponent],
      providers: [{ provide: MovementsApiService, useValue: apiMock }]
    }).compileComponents();
  });

  it('blocks submit when amount is invalid', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.patchValue({ valor: '0' });
    component.submitForm();

    expect(apiMock.create).not.toHaveBeenCalled();
    expect(component.formError()).toBe('Revisa los campos marcados en rojo antes de continuar.');
  });

  it('creates movement with normalized numeric payload', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.setValue(VALID_MOVEMENT_FORM);
    component.submitForm();

    expect(apiMock.create).toHaveBeenCalledWith({
      cuentaId: 10,
      tipoMovimiento: 'CREDIT',
      valor: 125.75
    });
  });

  it('opens the custom confirmation dialog before deleting a movement', () => {
    const component = createComponent();

    component.requestDeleteMovement(MOVEMENT_RESPONSE_FIXTURE);

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionMovement()).toEqual(MOVEMENT_RESPONSE_FIXTURE);
  });

  it('cancels movement deletion without calling the API', () => {
    const component = createComponent();

    component.requestDeleteMovement(MOVEMENT_RESPONSE_FIXTURE);
    component.closeDeleteMovementDialog();

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionMovement()).toBeNull();
  });

  it('deletes the movement only after confirmation', () => {
    const component = createComponent();

    component.requestDeleteMovement(MOVEMENT_RESPONSE_FIXTURE);
    component.confirmDeleteMovement();

    expect(apiMock.delete).toHaveBeenCalledWith(1);
    expect(component.pendingDeletionMovement()).toBeNull();
  });

  describe('totales de creditos y debitos (casos de negocio criticos)', () => {
    beforeEach(() => {
      apiMock.getAll.mockReturnValueOnce(of(MOVEMENT_LIST_FIXTURE));
    });

    it('calcula totalCredits sumando solo movimientos CREDIT', () => {
      // MOVEMENT_LIST_FIXTURE: CREDIT 200 + CREDIT 150 = 350
      const component = createComponent();

      expect(component.totalCredits()).toBe(350);
    });

    it('calcula totalDebits sumando solo movimientos DEBIT', () => {
      // MOVEMENT_LIST_FIXTURE: DEBIT 80 + DEBIT 120 = 200
      const component = createComponent();

      expect(component.totalDebits()).toBe(200);
    });

    it('no incluye movimientos DEBIT en totalCredits', () => {
      const component = createComponent();

      // Los 4 movimientos suman 550 en total; credits solo = 350
      expect(component.totalCredits()).not.toBe(550);
    });
  });
});
