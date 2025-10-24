import { Routes } from '@angular/router';
//import { Home } from './modules/principal/pages/home/home';
import { WelcomePage } from './modules/principal/pages/welcome-page/welcome-page';
import { Registre } from './modules/principal/pages/registre/registre';
import { Login } from './modules/principal/pages/login/login';
import { UsuarioAnciano } from './modules/principal/pages/usuarioAnciano/usuarioAnciano';
import { RegisterDoctor } from './modules/principal/pages/register-doctor/register-doctor';
import { UsuarioDoctor } from './modules/principal/pages/usuario-doctor/usuario-doctor';

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
	{
		path: 'register',
		component: Registre,
		pathMatch: 'full'
	},
	{
		path: 'login',
		component: Login,
		pathMatch: 'full'
	},
	{
		path: 'usuario',
		component: UsuarioAnciano,
		pathMatch: 'full'
	},
	{
		path: 'usuariodoctor',
		component: UsuarioDoctor,
		pathMatch: 'full'
	},
	{
		path: 'registerdoctor',
		component: RegisterDoctor,
		pathMatch: 'full'
	},
	{
		path: '**',
		redirectTo: ''
	}
	// Módulo 3 - Registro
	//{
	//	path: 'registro',
	//	loadComponent: () => import('./modules/registro/pages/registro/registro.page').then(m => m.RegistroPage)
	//},
	// fallback: redirect unknown paths to home (client-side)
];
