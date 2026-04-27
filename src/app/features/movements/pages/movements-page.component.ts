import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { MovementsApiService } from '../services/movements-api.service';
import type { MovementCreateRequest, MovementResponse } from '../models/movements.models';

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

@Component({
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  selector: 'app-movements-page',
  templateUrl: './movements-page.component.html',
  styleUrl: './movements-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovementsPageComponent {
  private readonly movementsApi = inject(MovementsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly searchTerm = signal('');
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly deletingMovementId = signal<number | null>(null);
  protected readonly pendingDeletionMovement = signal<MovementResponse | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly formError = signal('');

  protected readonly movements = signal<MovementResponse[]>([]);
  protected readonly deleteDialogMessage = computed(() => {
    const movement = this.pendingDeletionMovement();
    return movement ? `Esta accion eliminara el movimiento #${movement.id}.` : '';
  });
  protected readonly deletingPendingMovement = computed(() => {
    const movement = this.pendingDeletionMovement();
    return movement !== null && this.deletingMovementId() === movement.id;
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    cuentaId: ['1', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(999999999)]],
    tipoMovimiento: this.formBuilder.nonNullable.control<'CREDIT' | 'DEBIT'>('CREDIT', {
      validators: [Validators.required]
    }),
    valor: ['0', [Validators.required, Validators.pattern(MONEY_PATTERN), Validators.min(0.01), Validators.max(999999999.99)]]
  });

  protected readonly filteredMovements = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.movements();
    }

    return this.movements().filter((movement) => {
      return (
        movement.numeroCuenta.toLowerCase().includes(query) ||
        movement.tipoMovimiento.toLowerCase().includes(query) ||
        movement.fecha.toLowerCase().includes(query)
      );
    });
  });

  protected readonly totalCredits = computed(() => {
    return this.movements()
      .filter((movement) => movement.tipoMovimiento === 'CREDIT')
      .reduce((accumulator, movement) => accumulator + Math.abs(movement.valor), 0);
  });

  protected readonly totalDebits = computed(() => {
    return this.movements()
      .filter((movement) => movement.tipoMovimiento === 'DEBIT')
      .reduce((accumulator, movement) => accumulator + Math.abs(movement.valor), 0);
  });

  constructor() {
    this.loadMovements();
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected openCreateForm(): void {
    this.formError.set('');
    this.form.reset({
      cuentaId: '1',
      tipoMovimiento: 'CREDIT',
      valor: '0'
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.formError.set('');
  }

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(this.getFormValidationMessage());
      return;
    }

    const formValue = this.form.getRawValue();
    const cuentaId = Number(formValue.cuentaId);
    const valor = Number(formValue.valor);

    if (Number.isNaN(cuentaId) || Number.isNaN(valor)) {
      this.formError.set('CuentaId y valor deben ser valores numericos validos.');
      return;
    }

    this.formError.set('');

    const payload: MovementCreateRequest = {
      cuentaId,
      tipoMovimiento: formValue.tipoMovimiento,
      valor
    };

    this.submitting.set(true);

    this.movementsApi
      .create(payload)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.closeForm();
        this.loadMovements();
      });
  }

  private getFormValidationMessage(): string {
    return 'Revisa los campos marcados en rojo antes de continuar.';
  }

  protected requestDeleteMovement(movement: MovementResponse): void {
    this.pendingDeletionMovement.set(movement);
  }

  protected closeDeleteMovementDialog(): void {
    if (this.deletingPendingMovement()) {
      return;
    }

    this.pendingDeletionMovement.set(null);
  }

  protected confirmDeleteMovement(): void {
    const movement = this.pendingDeletionMovement();

    if (!movement) {
      return;
    }

    this.deletingMovementId.set(movement.id);

    this.movementsApi
      .delete(movement.id)
      .pipe(
        finalize(() => this.deletingMovementId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.pendingDeletionMovement.set(null);
        this.loadMovements();
      });
  }

  protected isDeleting(movementId: number): boolean {
    return this.deletingMovementId() === movementId;
  }

  private loadMovements(): void {
    this.loading.set(true);

    this.movementsApi
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((movements) => this.movements.set(movements));
  }
}
