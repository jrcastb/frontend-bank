import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsApiService } from '../services/reports-api.service';
import { ReportsPageComponent } from './reports-page.component';
import { REPORT_RESPONSE_FIXTURE } from '../../../../testing/form-test.constants';

type ReportsApiMock = {
  getReportJson: jest.Mock;
  getReportPdf: jest.Mock;
};

type ReportsComponentTestApi = {
  form: () => { clienteId: string; fechaDesde: string; fechaHasta: string };
  formError: () => string;
  reportResult: () => typeof REPORT_RESPONSE_FIXTURE | null;
  isDateRangeValid: () => boolean;
  canSubmit: () => boolean;
  updateClienteId: (v: string) => void;
  updateFechaDesde: (v: string) => void;
  updateFechaHasta: (v: string) => void;
  generateJsonReport: () => void;
  downloadPdfReport: () => void;
};

describe('ReportsPageComponent', () => {
  const apiMock: ReportsApiMock = {
    getReportJson: jest.fn(() => of(REPORT_RESPONSE_FIXTURE)),
    getReportPdf: jest.fn(() => of({ body: null, headers: { get: () => null } }))
  };

  const createComponent = (): ReportsComponentTestApi => {
    const fixture = TestBed.createComponent(ReportsPageComponent);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as ReportsComponentTestApi;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ReportsPageComponent],
      providers: [{ provide: ReportsApiService, useValue: apiMock }]
    }).compileComponents();
  });

  describe('validacion del formulario', () => {
    it('no llama al servicio si faltan campos requeridos', () => {
      const component = createComponent();

      component.generateJsonReport();

      expect(apiMock.getReportJson).not.toHaveBeenCalled();
      expect(component.formError()).toBe('Completa los campos requeridos y valida el rango de fechas.');
    });

    it('no llama al servicio si clienteId no es un numero positivo', () => {
      const component = createComponent();

      component.updateClienteId('abc');
      component.updateFechaDesde('2026-01-01');
      component.updateFechaHasta('2026-01-31');
      component.generateJsonReport();

      expect(apiMock.getReportJson).not.toHaveBeenCalled();
      expect(component.formError()).toBe('Cliente ID debe ser un numero positivo.');
    });

    it('no llama al servicio si clienteId es cero o negativo', () => {
      const component = createComponent();

      component.updateClienteId('0');
      component.updateFechaDesde('2026-01-01');
      component.updateFechaHasta('2026-01-31');
      component.generateJsonReport();

      expect(apiMock.getReportJson).not.toHaveBeenCalled();
    });
  });

  describe('isDateRangeValid', () => {
    it('retorna true cuando ambas fechas estan vacias', () => {
      const component = createComponent();

      expect(component.isDateRangeValid()).toBe(true);
    });

    it('retorna false cuando fechaDesde es posterior a fechaHasta', () => {
      const component = createComponent();

      component.updateFechaDesde('2026-02-01');
      component.updateFechaHasta('2026-01-01');

      expect(component.isDateRangeValid()).toBe(false);
    });

    it('retorna true cuando fechaDesde es igual a fechaHasta', () => {
      const component = createComponent();

      component.updateFechaDesde('2026-01-15');
      component.updateFechaHasta('2026-01-15');

      expect(component.isDateRangeValid()).toBe(true);
    });
  });

  describe('generateJsonReport', () => {
    it('llama a getReportJson con el filtro correcto', () => {
      const component = createComponent();

      component.updateClienteId('1');
      component.updateFechaDesde('2026-01-01');
      component.updateFechaHasta('2026-01-31');
      component.generateJsonReport();

      expect(apiMock.getReportJson).toHaveBeenCalledWith({
        clienteId: 1,
        fechaDesde: '2026-01-01',
        fechaHasta: '2026-01-31'
      });
    });

    it('establece reportResult tras respuesta exitosa', () => {
      const component = createComponent();

      component.updateClienteId('1');
      component.updateFechaDesde('2026-01-01');
      component.updateFechaHasta('2026-01-31');
      component.generateJsonReport();

      expect(component.reportResult()).toEqual(REPORT_RESPONSE_FIXTURE);
    });

    it('limpia formError antes de llamar al servicio', () => {
      const component = createComponent();

      // Primera llamada invalida para inducir un error
      component.generateJsonReport();
      expect(component.formError()).not.toBe('');

      // Ahora completamos el formulario correctamente
      component.updateClienteId('1');
      component.updateFechaDesde('2026-01-01');
      component.updateFechaHasta('2026-01-31');
      component.generateJsonReport();

      expect(component.formError()).toBe('');
    });
  });

  describe('downloadPdfReport', () => {
    it('llama a getReportPdf con el filtro correcto', () => {
      const component = createComponent();

      component.updateClienteId('5');
      component.updateFechaDesde('2026-03-01');
      component.updateFechaHasta('2026-03-31');
      component.downloadPdfReport();

      expect(apiMock.getReportPdf).toHaveBeenCalledWith({
        clienteId: 5,
        fechaDesde: '2026-03-01',
        fechaHasta: '2026-03-31'
      });
    });

    it('no llama a getReportPdf si el formulario no es valido', () => {
      const component = createComponent();

      component.downloadPdfReport();

      expect(apiMock.getReportPdf).not.toHaveBeenCalled();
    });
  });
});
