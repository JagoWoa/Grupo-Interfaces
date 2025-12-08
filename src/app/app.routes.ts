import { Routes } from '@angular/router';
import { WelcomePage } from './modules/principal/pages/welcome-page/welcome-page';
import { Registre } from './modules/principal/pages/registre/registre';
import { Login } from './modules/principal/pages/login/login';
import { UsuarioAnciano } from './modules/principal/pages/usuarioAnciano/usuarioAnciano';
import { RegisterDoctor } from './modules/principal/pages/register-doctor/register-doctor';
import { UsuarioDoctor } from './modules/principal/pages/usuario-doctor/usuario-doctor';
import { Perfil } from "./modules/principal/pages/perfil/perfil";
import { Dashboard } from "./modules/principal/pages/dashboard/dashboard";
import { ChatPage } from './modules/principal/pages/chat-page/chat-page';
import { authGuard } from './core/guards/auth.guard';
import { RecuperarContrasena } from './modules/principal/pages/recuperar-contrasena/recuperar-contrasena';

export const routes: Routes = [
	// Rutas públicas (accesibles sin login)
	{
		path: 'inicio',
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
		path: 'recuperar-contrasena',
		component: RecuperarContrasena,
		pathMatch: 'full'
	},
	{
		path: 'registerdoctor',
		component: RegisterDoctor,
		pathMatch: 'full'
	},
	// Rutas protegidas (requieren autenticación)
	{
		path: 'dashboard',
		component: Dashboard,
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'perfil',
		component: Perfil,
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'usuario',
		component: UsuarioAnciano,
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'usuariodoctor',
		component: UsuarioDoctor,
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	{
		path: 'chat',
		component: ChatPage,
		pathMatch: 'full',
		canActivate: [authGuard]
	},
	
	// Fallback: redirect unknown paths to home
	{
		path: '**',
		redirectTo: ''
	}
];

