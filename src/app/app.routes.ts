import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	// Rutas públicas (accesibles sin login) - Carga inmediata para páginas principales
	{
		path: '',
		loadComponent: () => import('./modules/principal/pages/welcome-page/welcome-page').then(m => m.WelcomePage),
		pathMatch: 'full'
	},
	{
		path: 'inicio',
		loadComponent: () => import('./modules/principal/pages/welcome-page/welcome-page').then(m => m.WelcomePage),
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () => import('./modules/principal/pages/login/login').then(m => m.Login),
		pathMatch: 'full'
	},
	{
		path: 'register',
		loadComponent: () => import('./modules/principal/pages/registre/registre').then(m => m.Registre),
		pathMatch: 'full'
	},
	{
		path: 'registerdoctor',
		loadComponent: () => import('./modules/principal/pages/register-doctor/register-doctor').then(m => m.RegisterDoctor),
		pathMatch: 'full'
	},
	{
		path: 'recuperar-contrasena',
		loadComponent: () => import('./modules/principal/pages/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena),
		pathMatch: 'full'
	},
	{
		path: 'reset-password',
		loadComponent: () => import('./modules/principal/pages/reset-password/reset-password').then(m => m.ResetPassword),
		pathMatch: 'full'
	},
	{
		path: 'terminos-condiciones',
		loadComponent: () => import('./modules/principal/pages/terminos-condiciones/terminos-condiciones').then(m => m.TerminosCondiciones),
		pathMatch: 'full'
	},
	{
		path: 'politica-privacidad',
		loadComponent: () => import('./modules/principal/pages/politica-privacidad/politica-privacidad').then(m => m.PoliticaPrivacidad),
		pathMatch: 'full'
	},

	// Rutas protegidas (requieren autenticación) - Lazy Loading
	{
		path: 'dashboard',
		loadComponent: () => import('./modules/principal/pages/dashboard/dashboard').then(m => m.Dashboard),
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'perfil',
		loadComponent: () => import('./modules/principal/pages/perfil/perfil').then(m => m.Perfil),
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'usuario',
		loadComponent: () => import('./modules/principal/pages/usuarioAnciano/usuarioAnciano').then(m => m.UsuarioAnciano),
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'usuariodoctor',
		loadComponent: () => import('./modules/principal/pages/usuario-doctor/usuario-doctor').then(m => m.UsuarioDoctor),
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'chat',
		loadComponent: () => import('./modules/principal/pages/chat-page/chat-page').then(m => m.ChatPage),
		pathMatch: 'full',
		canActivate: [authGuard]
	},

	// Fallback: redirect unknown paths to home
	{
		path: '**',
		redirectTo: ''
	}
];
