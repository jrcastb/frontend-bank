import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface MovementRow {
  id: number;
  fecha: string;
  cuenta: string;
  tipoMovimiento: 'CREDIT' | 'DEBIT';
  valor: number;
  saldo: number;
}

@Component({
  imports: [CommonModule],
  selector: 'app-movements-page',
  templateUrl: './movements-page.component.html',
  styleUrl: './movements-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovementsPageComponent {
  protected readonly searchTerm = signal('');

  protected readonly movements = signal<MovementRow[]>([
    { id: 1, fecha: '2026-04-25T09:30:00', cuenta: '225487', tipoMovimiento: 'CREDIT', valor: 600, saldo: 1600 },
    { id: 2, fecha: '2026-04-25T11:00:00', cuenta: '225487', tipoMovimiento: 'DEBIT', valor: -120, saldo: 1480 },
    { id: 3, fecha: '2026-04-25T14:15:00', cuenta: '495878', tipoMovimiento: 'DEBIT', valor: -50, saldo: 700 }
  ]);

  protected readonly filteredMovements = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.movements();
    }

    return this.movements().filter((movement) => {
      return (
        movement.cuenta.toLowerCase().includes(query) ||
        movement.tipoMovimiento.toLowerCase().includes(query) ||
        movement.fecha.toLowerCase().includes(query)
      );
    });
  });

  protected readonly totalCredits = computed(() => {
    return this.movements()
      .filter((movement) => movement.tipoMovimiento === 'CREDIT')
      .reduce((accumulator, movement) => accumulator + movement.valor, 0);
  });

  protected readonly totalDebits = computed(() => {
    return this.movements()
      .filter((movement) => movement.tipoMovimiento === 'DEBIT')
      .reduce((accumulator, movement) => accumulator + movement.valor, 0);
  });

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }
}
