import { Routes } from '@angular/router';
import { Home } from './modules/principal/pages/home/home';

export const routes: Routes = [
	{
		path: '',
		component: Home,
		pathMatch: 'full'
	},
	// Módulo 3 - Registro
	{
		path: 'registro',
		loadComponent: () => import('./modules/registro/pages/registro/registro.page').then(m => m.RegistroPage)
	},
	// fallback: redirect unknown paths to home (client-side)
	{
		path: '**',
		redirectTo: ''
	}
];
