import { RenderMode, ServerRoute } from '@angular/ssr';

// This app's auth model is entirely client-side (localStorage, no cookies/
// session), and every route guard (loginGuard, authGuard) depends on
// StorageService, which only has real data inside the browser
// (isPlatformBrowser). Prerendering or SSR-rendering these routes bakes in
// a guard decision made with NO token visible (build/server time), and that
// static/rendered HTML then gets served on every request afterwards -
// including hard refreshes - regardless of the real logged-in state.
//
// RenderMode.Client ships an empty shell and lets Angular bootstrap and
// route fully in-browser, so guards always evaluate against the real
// localStorage on every navigation and every hard refresh.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
