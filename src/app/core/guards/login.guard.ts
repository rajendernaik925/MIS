import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { StorageService } from "../services/storage.service";

export const loginGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const accessToken = storage.get<string>('accessToken');
  const expiryTime = storage.get<number>('expiryTime');

  const now = Math.floor(Date.now() / 1000);

  const empId = route.paramMap.get('empId');
  const pwd = route.paramMap.get('pwd');

  // ✅ Allow login page if SSO params exist
  if (empId && pwd) {
    storage.removeTokens();
    return true;
  }

  // If already logged in → go to dashboard
  if (accessToken && expiryTime && expiryTime > now) {
    return router.createUrlTree(['/']);
  }

  return true;
};