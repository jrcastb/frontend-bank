import type { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./shared/ui/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'clientes'
			},
			{
				path: 'clientes',
				loadComponent: () =>
					import('./features/clients/pages/clients-page.component').then((m) => m.ClientsPageComponent)
			},
			{
				path: 'cuentas',
				loadComponent: () =>
					import('./features/accounts/pages/accounts-page.component').then((m) => m.AccountsPageComponent)
			},
			{
				path: 'movimientos',
				loadComponent: () =>
					import('./features/movements/pages/movements-page.component').then((m) => m.MovementsPageComponent)
			},
			{
				path: 'reportes',
				loadComponent: () =>
					import('./features/reports/pages/reports-page.component').then((m) => m.ReportsPageComponent)
			}
		]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
