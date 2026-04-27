import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccountsApiService } from '../services/accounts-api.service';
import { AccountsPageComponent } from './accounts-page.component';
import { ACCOUNT_RESPONSE_FIXTURE, VALID_ACCOUNT_FORM } from '../../../../testing/form-test.constants';

type AccountsApiMock = {
  getAll: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

type AccountsComponentTestApi = {
  form: {
    patchValue: (value: Partial<typeof VALID_ACCOUNT_FORM>) => void;
    setValue: (value: typeof VALID_ACCOUNT_FORM) => void;
  };
  pendingDeletionAccount: () => typeof ACCOUNT_RESPONSE_FIXTURE | null;
  formError: () => string;
  openCreateForm: () => void;
  openEditForm: (account: typeof ACCOUNT_RESPONSE_FIXTURE) => void;
  requestDeleteAccount: (account: typeof ACCOUNT_RESPONSE_FIXTURE) => void;
  closeDeleteAccountDialog: () => void;
  confirmDeleteAccount: () => void;
  submitForm: () => void;
};

describe('AccountsPageComponent', () => {
  const apiMock: AccountsApiMock = {
    getAll: jest.fn(() => of([ACCOUNT_RESPONSE_FIXTURE])),
    create: jest.fn(() => of(ACCOUNT_RESPONSE_FIXTURE)),
    update: jest.fn(() => of(ACCOUNT_RESPONSE_FIXTURE)),
    delete: jest.fn(() => of(void 0))
  };

  const createComponent = (): AccountsComponentTestApi => {
    const fixture = TestBed.createComponent(AccountsPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as AccountsComponentTestApi;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AccountsPageComponent],
      providers: [{ provide: AccountsApiService, useValue: apiMock }]
    }).compileComponents();
  });

  it('blocks submit with invalid account number and sets message', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.patchValue({
      numeroCuenta: '12'
    });

    component.submitForm();

    expect(apiMock.create).not.toHaveBeenCalled();
    expect(component.formError()).toBe('Revisa los campos marcados en rojo antes de continuar.');
  });

  it('creates account with sanitized payload when form is valid', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.setValue({
      ...VALID_ACCOUNT_FORM,
      numeroCuenta: '1234567890'
    });

    component.submitForm();

    expect(apiMock.create).toHaveBeenCalledWith({
      clienteId: 10,
      numeroCuenta: '1234567890',
      tipoCuenta: 'AHORROS',
      saldoInicial: 250.5,
      estado: true
    });
  });

  it('updates account when editing existing record', () => {
    const component = createComponent();

    component.openEditForm(ACCOUNT_RESPONSE_FIXTURE);
    component.form.patchValue({ clienteId: '10', saldoInicial: '300.00' });

    component.submitForm();

    expect(apiMock.update).toHaveBeenCalledWith(1, {
      clienteId: 10,
      numeroCuenta: '1234567890',
      tipoCuenta: 'AHORROS',
      saldoInicial: 300,
      estado: true
    });
  });

  it('opens the custom confirmation dialog before deleting an account', () => {
    const component = createComponent();

    component.requestDeleteAccount(ACCOUNT_RESPONSE_FIXTURE);

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionAccount()).toEqual(ACCOUNT_RESPONSE_FIXTURE);
  });

  it('cancels account deletion without calling the API', () => {
    const component = createComponent();

    component.requestDeleteAccount(ACCOUNT_RESPONSE_FIXTURE);
    component.closeDeleteAccountDialog();

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionAccount()).toBeNull();
  });

  it('deletes the account only after confirmation', () => {
    const component = createComponent();

    component.requestDeleteAccount(ACCOUNT_RESPONSE_FIXTURE);
    component.confirmDeleteAccount();

    expect(apiMock.delete).toHaveBeenCalledWith(1);
    expect(component.pendingDeletionAccount()).toBeNull();
  });
});
