import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavItem {
  label: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly navItems: NavItem[] = [
    { label: 'Clientes', route: '/clientes', description: 'Gestion de personas y estado del cliente.' },
    { label: 'Cuentas', route: '/cuentas', description: 'Administracion de cuentas de ahorro y corriente.' },
    { label: 'Movimientos', route: '/movimientos', description: 'Registro de creditos y debitos por cuenta.' },
    { label: 'Reportes', route: '/reportes', description: 'Estado de cuenta por rango de fechas y cliente.' }
  ];

  protected readonly currentUrl = signal(this.router.url);

  protected readonly pageTitle = computed(() => {
    const current = this.navItems.find((item) => this.currentUrl().startsWith(item.route));
    return current?.label ?? 'Dashboard';
  });

  protected readonly pageDescription = computed(() => {
    const current = this.navItems.find((item) => this.currentUrl().startsWith(item.route));
    return current?.description ?? 'Selecciona un modulo para comenzar.';
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }
}
