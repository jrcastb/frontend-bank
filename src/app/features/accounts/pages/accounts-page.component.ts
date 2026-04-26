import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface AccountRow {
  id: number;
  cliente: string;
  numeroCuenta: string;
  tipoCuenta: 'AHORROS' | 'CORRIENTE';
  saldoInicial: number;
  estado: boolean;
}

@Component({
  selector: 'app-accounts-page',
  imports: [CommonModule],
  templateUrl: './accounts-page.component.html',
  styleUrl: './accounts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsPageComponent {
  protected readonly searchTerm = signal('');

  protected readonly accounts = signal<AccountRow[]>([
    { id: 1, cliente: 'Marianela Montalvo', numeroCuenta: '225487', tipoCuenta: 'AHORROS', saldoInicial: 1000, estado: true },
    { id: 2, cliente: 'Jose Lema', numeroCuenta: '495878', tipoCuenta: 'CORRIENTE', saldoInicial: 750, estado: true },
    { id: 3, cliente: 'Ana Flores', numeroCuenta: '887799', tipoCuenta: 'AHORROS', saldoInicial: 230, estado: false }
  ]);

  protected readonly filteredAccounts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.accounts();
    }

    return this.accounts().filter((account) => {
      return (
        account.cliente.toLowerCase().includes(query) ||
        account.numeroCuenta.toLowerCase().includes(query) ||
        account.tipoCuenta.toLowerCase().includes(query)
      );
    });
  });

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }
}
