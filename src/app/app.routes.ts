import { Routes } from '@angular/router';
import { Home } from './modules/principal/pages/home/home';
import { WelcomePage } from './modules/principal/pages/welcome-page/welcome-page';
export const routes: Routes = [
	{
		path: 'home',
		component: WelcomePage,
		pathMatch: 'full'
	},
	{
		path: '',
		component: WelcomePage,
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
