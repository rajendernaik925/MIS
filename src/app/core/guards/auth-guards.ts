import { inject } from "@angular/core";
import { CanActivateChildFn, Router, UrlTree } from "@angular/router";
import { StorageService } from "../services/storage.service";

export const authGuard: CanActivateChildFn = (_route, state): boolean | UrlTree => {
  const router = inject(Router);
  const storage = inject(StorageService);

  const accessToken = storage.get<string>('accessToken');
  const expiryTime = storage.get<number>('expiryTime');

  const now = Math.floor(Date.now() / 1000);

  // Allow public routes
  if (state.url === '/auth' || state.url === '/login' || state.url === '/server-error') {
    return true;
  }

  // If access token is missing or expired → redirect to /auth
  if (!accessToken || !expiryTime || expiryTime < now) {
    storage.removeTokens?.(); // clear any leftover tokens
    return router.createUrlTree(['/auth']); // redirect
  }

  // Token valid → allow route
  return true;
};
