import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ClientsApiService } from '../services/clients-api.service';
import type { ClientPatchRequest, ClientResponse, ClientUpsertRequest } from '../models/clients.models';

const NAME_PATTERN = /^[\p{L}\s'.-]{2,120}$/u;
const IDENTIFICATION_PATTERN = /^[A-Za-z0-9-]{6,20}$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,255}$/;

function nonWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().length === 0 ? { whitespace: true } : null;
}

@Component({
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsPageComponent {
  private readonly clientsApi = inject(ClientsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly searchTerm = signal('');
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly removingClientId = signal<number | null>(null);
  protected readonly pendingDeletionClient = signal<ClientResponse | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly editingClientId = signal<number | null>(null);
  protected readonly formError = signal('');

  protected readonly clients = signal<ClientResponse[]>([]);
  protected readonly deleteDialogMessage = computed(() => {
    const client = this.pendingDeletionClient();
    return client ? `Esta accion eliminara al cliente ${client.nombre}.` : '';
  });
  protected readonly deletingPendingClient = computed(() => {
    const client = this.pendingDeletionClient();
    return client !== null && this.removingClientId() === client.id;
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120), Validators.pattern(NAME_PATTERN)]],
    genero: this.formBuilder.nonNullable.control<'MASCULINO' | 'FEMENINO' | 'OTRO'>('MASCULINO', {
      validators: [Validators.required]
    }),
    edad: ['18', [Validators.required, Validators.pattern(/^\d{1,3}$/), Validators.min(0), Validators.max(130)]],
    identificacion: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(IDENTIFICATION_PATTERN),
        nonWhitespaceValidator
      ]
    ],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(180), nonWhitespaceValidator]],
    telefono: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    contrasena: ['', [Validators.minLength(8), Validators.maxLength(255), Validators.pattern(PASSWORD_PATTERN)]],
    estado: [true]
  });

  protected readonly filteredClients = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.clients();
    }

    return this.clients().filter((client) => {
      return (
        client.nombre.toLowerCase().includes(query) ||
        client.identificacion.toLowerCase().includes(query) ||
        client.telefono.toLowerCase().includes(query)
      );
    });
  });

  constructor() {
    this.loadClients();
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected openCreateForm(): void {
    this.formError.set('');
    this.editingClientId.set(null);
    this.form.reset({
      nombre: '',
      genero: 'MASCULINO',
      edad: '18',
      identificacion: '',
      direccion: '',
      telefono: '',
      contrasena: '',
      estado: true
    });
    this.form.controls.contrasena.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255),
      Validators.pattern(PASSWORD_PATTERN)
    ]);
    this.form.controls.contrasena.updateValueAndValidity();
    this.isFormOpen.set(true);
  }

  protected openEditForm(client: ClientResponse): void {
    this.formError.set('');
    this.editingClientId.set(client.id);
    this.form.reset({
      nombre: client.nombre,
      genero: client.genero,
      edad: String(client.edad),
      identificacion: client.identificacion,
      direccion: client.direccion,
      telefono: client.telefono,
      contrasena: '',
      estado: client.estado
    });
    this.form.controls.contrasena.setValidators([
      Validators.minLength(8),
      Validators.maxLength(255),
      Validators.pattern(PASSWORD_PATTERN)
    ]);
    this.form.controls.contrasena.updateValueAndValidity();
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingClientId.set(null);
    this.formError.set('');
  }

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(this.getFormValidationMessage());
      return;
    }

    const formValue = this.form.getRawValue();
    const edad = Number(formValue.edad);

    if (Number.isNaN(edad)) {
      this.formError.set('La edad debe ser un numero valido.');
      return;
    }

    const clientId = this.editingClientId();
    this.submitting.set(true);
    this.formError.set('');

    if (clientId === null) {
      const payload: ClientUpsertRequest = {
        nombre: formValue.nombre.trim(),
        genero: formValue.genero,
        edad,
        identificacion: formValue.identificacion.trim(),
        direccion: formValue.direccion.trim(),
        telefono: formValue.telefono.trim(),
        contrasena: formValue.contrasena.trim(),
        estado: formValue.estado
      };

      this.clientsApi
        .create(payload)
        .pipe(
          finalize(() => this.submitting.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.closeForm();
          this.loadClients();
        });

      return;
    }

    const payloadBase = {
      nombre: formValue.nombre.trim(),
      genero: formValue.genero,
      edad,
      identificacion: formValue.identificacion.trim(),
      direccion: formValue.direccion.trim(),
      telefono: formValue.telefono.trim(),
      estado: formValue.estado
    };

    const password = formValue.contrasena.trim();

    if (password) {
      const payload: ClientUpsertRequest = {
        ...payloadBase,
        contrasena: password
      };

      this.clientsApi
        .update(clientId, payload)
        .pipe(
          finalize(() => this.submitting.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.closeForm();
          this.loadClients();
        });

      return;
    }

    const patchPayload: ClientPatchRequest = payloadBase;

    this.clientsApi
      .patch(clientId, patchPayload)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.closeForm();
        this.loadClients();
      });
  }

  private getFormValidationMessage(): string {
    return 'Revisa los campos marcados en rojo antes de continuar.';
  }

  protected requestDeleteClient(client: ClientResponse): void {
    this.pendingDeletionClient.set(client);
  }

  protected closeDeleteClientDialog(): void {
    if (this.deletingPendingClient()) {
      return;
    }

    this.pendingDeletionClient.set(null);
  }

  protected confirmDeleteClient(): void {
    const client = this.pendingDeletionClient();

    if (!client) {
      return;
    }

    this.removingClientId.set(client.id);

    this.clientsApi
      .delete(client.id)
      .pipe(
        finalize(() => this.removingClientId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.pendingDeletionClient.set(null);
        this.loadClients();
      });
  }

  protected isSavingClient(clientId: number): boolean {
    return this.removingClientId() === clientId;
  }

  private loadClients(): void {
    this.loading.set(true);

    this.clientsApi
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((clients) => {
        this.clients.set(clients);
      });
  }
}
