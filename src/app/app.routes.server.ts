import { RenderMode, ServerRoute } from '@angular/ssr';

// Server-side routes: prerender known pages, fall back to SSR for others
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // Let the server render other routes dynamically (SSR). This avoids
  // prerendering every possible URL while still allowing SSR for unknowns.
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
