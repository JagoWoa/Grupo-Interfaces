import { Routes } from '@angular/router';
import { Home } from './modules/principal/pages/home/home';

export const routes: Routes = [
	{
		path: 'home',
		component: Home,
		pathMatch: 'full'
	},
	{
		path: '',
		component: Home,
		pathMatch: 'full'
	},
	// fallback: redirect unknown paths to home (client-side)
	{
		path: '**',
		redirectTo: ''
	}
];
