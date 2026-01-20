import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Precarga todas las rutas lazy en segundo plano después de que la app cargue
      withPreloading(PreloadAllModules),
      // Habilita transiciones suaves entre páginas
      withViewTransitions()
    ),
    // Usa la API Fetch nativa para mejor rendimiento
    provideHttpClient(withFetch())
  ]
};
