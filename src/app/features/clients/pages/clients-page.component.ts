import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ClientsApiService } from '../services/clients-api.service';
import type { ClientPatchRequest, ClientResponse, ClientUpsertRequest } from '../models/clients.models';

@Component({
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule],
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
  protected readonly isFormOpen = signal(false);
  protected readonly editingClientId = signal<number | null>(null);
  protected readonly formError = signal('');

  protected readonly clients = signal<ClientResponse[]>([]);

  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    genero: this.formBuilder.nonNullable.control<'MASCULINO' | 'FEMENINO' | 'OTRO'>('MASCULINO', {
      validators: [Validators.required]
    }),
    edad: ['18', [Validators.required, Validators.min(0), Validators.max(130)]],
    identificacion: ['', [Validators.required, Validators.maxLength(50)]],
    direccion: ['', [Validators.required, Validators.maxLength(180)]],
    telefono: ['', [Validators.required, Validators.maxLength(30)]],
    contrasena: ['', [Validators.minLength(8), Validators.maxLength(255)]],
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
    this.form.controls.contrasena.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(255)]);
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
    this.form.controls.contrasena.setValidators([Validators.minLength(8), Validators.maxLength(255)]);
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

  protected deleteClient(client: ClientResponse): void {
    const shouldDelete = window.confirm(`Eliminar cliente ${client.nombre}?`);

    if (!shouldDelete) {
      return;
    }

    this.removingClientId.set(client.id);

    this.clientsApi
      .delete(client.id)
      .pipe(
        finalize(() => this.removingClientId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadClients());
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
