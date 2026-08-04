import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  private router: Router = inject(Router);
  private storageService: StorageService = inject(StorageService);
  private logoutTimer: any;

  // Start Auto Logout
  startAutoLogout() {
    console.log("Starting auto logout timer...");

    const expiryTime = this.storageService.get<number>('expiryTime');
    // const expiryTime = Date.now() + 60 * 1000;

    if (!expiryTime) return;

    const timeout = expiryTime - Date.now();

    if (timeout > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, timeout);
    } else {
      this.logout();
    }
  }

  // Logout Method
  logout() {
    this.storageService.removeTokens?.();
    this.router.navigate(['/auth']);
  }

  // Clear Timer
  clearLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

}