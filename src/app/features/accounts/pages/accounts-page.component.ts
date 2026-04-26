import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { AccountsApiService } from '../services/accounts-api.service';
import type { AccountResponse, AccountUpsertRequest } from '../models/accounts.models';

const ACCOUNT_NUMBER_PATTERN = /^\d{6,20}$/;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

@Component({
  selector: 'app-accounts-page',
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './accounts-page.component.html',
  styleUrl: './accounts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsPageComponent {
  private readonly accountsApi = inject(AccountsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly searchTerm = signal('');
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly deletingAccountId = signal<number | null>(null);
  protected readonly pendingDeletionAccount = signal<AccountResponse | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly editingAccountId = signal<number | null>(null);
  protected readonly formError = signal('');

  protected readonly accounts = signal<AccountResponse[]>([]);
  protected readonly deleteDialogMessage = computed(() => {
    const account = this.pendingDeletionAccount();
    return account ? `Esta accion eliminara la cuenta ${account.numeroCuenta}.` : '';
  });
  protected readonly deletingPendingAccount = computed(() => {
    const account = this.pendingDeletionAccount();
    return account !== null && this.deletingAccountId() === account.id;
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    clienteId: ['1', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(999999999)]],
    numeroCuenta: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(ACCOUNT_NUMBER_PATTERN)]
    ],
    tipoCuenta: this.formBuilder.nonNullable.control<'AHORROS' | 'CORRIENTE'>('AHORROS', {
      validators: [Validators.required]
    }),
    saldoInicial: ['0', [Validators.required, Validators.pattern(MONEY_PATTERN), Validators.min(0), Validators.max(999999999.99)]],
    estado: [true]
  });

  protected readonly filteredAccounts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.accounts();
    }

    return this.accounts().filter((account) => {
      return (
        String(account.clienteId).includes(query) ||
        account.numeroCuenta.toLowerCase().includes(query) ||
        account.tipoCuenta.toLowerCase().includes(query)
      );
    });
  });

  constructor() {
    this.loadAccounts();
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected openCreateForm(): void {
    this.formError.set('');
    this.editingAccountId.set(null);
    this.form.reset({
      clienteId: '1',
      numeroCuenta: '',
      tipoCuenta: 'AHORROS',
      saldoInicial: '0',
      estado: true
    });
    this.isFormOpen.set(true);
  }

  protected openEditForm(account: AccountResponse): void {
    this.formError.set('');
    this.editingAccountId.set(account.id);
    this.form.reset({
      clienteId: String(account.clienteId),
      numeroCuenta: account.numeroCuenta,
      tipoCuenta: account.tipoCuenta,
      saldoInicial: String(account.saldoInicial),
      estado: account.estado
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingAccountId.set(null);
    this.formError.set('');
  }

  protected submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(this.getFormValidationMessage());
      return;
    }

    const formValue = this.form.getRawValue();
    const clienteId = Number(formValue.clienteId);
    const saldoInicial = Number(formValue.saldoInicial);

    if (Number.isNaN(clienteId) || Number.isNaN(saldoInicial)) {
      this.formError.set('ClienteId y saldo inicial deben ser valores numericos validos.');
      return;
    }

    this.formError.set('');

    const payload: AccountUpsertRequest = {
      clienteId,
      numeroCuenta: formValue.numeroCuenta.trim(),
      tipoCuenta: formValue.tipoCuenta,
      saldoInicial,
      estado: formValue.estado
    };

    const editingAccountId = this.editingAccountId();
    this.submitting.set(true);

    const request$ = editingAccountId === null
      ? this.accountsApi.create(payload)
      : this.accountsApi.update(editingAccountId, payload);

    request$
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.closeForm();
        this.loadAccounts();
      });
  }

  private getFormValidationMessage(): string {
    return 'Revisa los campos marcados en rojo antes de continuar.';
  }

  protected requestDeleteAccount(account: AccountResponse): void {
    this.pendingDeletionAccount.set(account);
  }

  protected closeDeleteAccountDialog(): void {
    if (this.deletingPendingAccount()) {
      return;
    }

    this.pendingDeletionAccount.set(null);
  }

  protected confirmDeleteAccount(): void {
    const account = this.pendingDeletionAccount();

    if (!account) {
      return;
    }

    this.deletingAccountId.set(account.id);

    this.accountsApi
      .delete(account.id)
      .pipe(
        finalize(() => this.deletingAccountId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.pendingDeletionAccount.set(null);
        this.loadAccounts();
      });
  }

  protected isDeleting(accountId: number): boolean {
    return this.deletingAccountId() === accountId;
  }

  private loadAccounts(): void {
    this.loading.set(true);

    this.accountsApi
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((accounts) => this.accounts.set(accounts));
  }
}
