import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClientsApiService } from '../services/clients-api.service';
import { ClientsPageComponent } from './clients-page.component';
import { CLIENT_RESPONSE_FIXTURE, VALID_CLIENT_FORM } from '../../../../testing/form-test.constants';

type ClientsApiMock = {
  getAll: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
};

type ClientsComponentTestApi = {
  form: {
    patchValue: (value: Partial<typeof VALID_CLIENT_FORM>) => void;
    setValue: (value: typeof VALID_CLIENT_FORM) => void;
  };
  editingClientId: () => number | null;
  pendingDeletionClient: () => typeof CLIENT_RESPONSE_FIXTURE | null;
  formError: () => string;
  openCreateForm: () => void;
  openEditForm: (client: typeof CLIENT_RESPONSE_FIXTURE) => void;
  requestDeleteClient: (client: typeof CLIENT_RESPONSE_FIXTURE) => void;
  closeDeleteClientDialog: () => void;
  confirmDeleteClient: () => void;
  submitForm: () => void;
};

describe('ClientsPageComponent', () => {
  const apiMock: ClientsApiMock = {
    getAll: jest.fn(() => of([CLIENT_RESPONSE_FIXTURE])),
    create: jest.fn(() => of(CLIENT_RESPONSE_FIXTURE)),
    update: jest.fn(() => of(CLIENT_RESPONSE_FIXTURE)),
    patch: jest.fn(() => of(CLIENT_RESPONSE_FIXTURE)),
    delete: jest.fn(() => of(void 0))
  };

  const createComponent = (): ClientsComponentTestApi => {
    const fixture = TestBed.createComponent(ClientsPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as ClientsComponentTestApi;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ClientsPageComponent],
      providers: [{ provide: ClientsApiService, useValue: apiMock }]
    }).compileComponents();
  });

  it('blocks submit when form is invalid and shows validation message', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.patchValue({ nombre: '' });
    component.submitForm();

    expect(apiMock.create).not.toHaveBeenCalled();
    expect(component.formError()).toBe('Revisa los campos marcados en rojo antes de continuar.');
  });

  it('creates a client with trimmed payload when form is valid', () => {
    const component = createComponent();

    component.openCreateForm();
    component.form.setValue({
      ...VALID_CLIENT_FORM,
      nombre: '  Juan Perez  ',
      identificacion: 'ABC12345',
      direccion: '  Av. Siempre Viva 123  ',
      telefono: '+593987654321',
      contrasena: 'Clave1234'
    });

    component.submitForm();

    expect(apiMock.create).toHaveBeenCalledWith({
      ...VALID_CLIENT_FORM,
      nombre: 'Juan Perez',
      identificacion: 'ABC12345',
      direccion: 'Av. Siempre Viva 123',
      telefono: '+593987654321',
      contrasena: 'Clave1234',
      edad: 31
    });
  });

  it('uses patch when editing without password', () => {
    const component = createComponent();

    component.openEditForm(CLIENT_RESPONSE_FIXTURE);
    component.form.patchValue({ contrasena: '' });

    component.submitForm();

    expect(apiMock.patch).toHaveBeenCalledWith(1, {
      nombre: CLIENT_RESPONSE_FIXTURE.nombre,
      genero: CLIENT_RESPONSE_FIXTURE.genero,
      edad: CLIENT_RESPONSE_FIXTURE.edad,
      identificacion: CLIENT_RESPONSE_FIXTURE.identificacion,
      direccion: CLIENT_RESPONSE_FIXTURE.direccion,
      telefono: CLIENT_RESPONSE_FIXTURE.telefono,
      estado: CLIENT_RESPONSE_FIXTURE.estado
    });
    expect(apiMock.update).not.toHaveBeenCalled();
  });

  it('uses update when editing with password', () => {
    const component = createComponent();

    component.openEditForm(CLIENT_RESPONSE_FIXTURE);
    component.form.patchValue({ contrasena: 'NuevaClave9' });

    component.submitForm();

    expect(apiMock.update).toHaveBeenCalledWith(1, {
      nombre: CLIENT_RESPONSE_FIXTURE.nombre,
      genero: CLIENT_RESPONSE_FIXTURE.genero,
      edad: CLIENT_RESPONSE_FIXTURE.edad,
      identificacion: CLIENT_RESPONSE_FIXTURE.identificacion,
      direccion: CLIENT_RESPONSE_FIXTURE.direccion,
      telefono: CLIENT_RESPONSE_FIXTURE.telefono,
      estado: CLIENT_RESPONSE_FIXTURE.estado,
      contrasena: 'NuevaClave9'
    });
  });

  it('opens the custom confirmation dialog before deleting a client', () => {
    const component = createComponent();

    component.requestDeleteClient(CLIENT_RESPONSE_FIXTURE);

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionClient()).toEqual(CLIENT_RESPONSE_FIXTURE);
  });

  it('cancels client deletion without calling the API', () => {
    const component = createComponent();

    component.requestDeleteClient(CLIENT_RESPONSE_FIXTURE);
    component.closeDeleteClientDialog();

    expect(apiMock.delete).not.toHaveBeenCalled();
    expect(component.pendingDeletionClient()).toBeNull();
  });

  it('deletes the client only after confirmation', () => {
    const component = createComponent();

    component.requestDeleteClient(CLIENT_RESPONSE_FIXTURE);
    component.confirmDeleteClient();

    expect(apiMock.delete).toHaveBeenCalledWith(1);
    expect(component.pendingDeletionClient()).toBeNull();
  });
});
