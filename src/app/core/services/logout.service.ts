import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  private router: Router = inject(Router);
  private storageService: StorageService = inject(StorageService);
  private settingsService: SettingsService = inject(SettingsService);
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  // Start Auto Logout
  startAutoLogout(): void {
    this.clearLogoutTimer();

    // expiryTime is stored in epoch SECONDS (from the JWT's `exp`),
    // Date.now() is epoch MILLISECONDS - convert before diffing, or the
    // timer fires almost immediately.
    const expiryTime = this.storageService.get<number>('expiryTime');

    if (!expiryTime) return;

    const timeout = expiryTime * 1000 - Date.now();

    if (timeout > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, timeout);
    } else {
      this.logout();
    }
  }

  // Logout Method
  logout(): void {
    this.clearLogoutTimer();
    this.storageService.removeTokens();
    this.settingsService.clear();
    this.router.navigate(['/auth/login']);
  }

  // Clear Timer
  clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }
}
