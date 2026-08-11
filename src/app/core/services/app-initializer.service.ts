import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';
import { LogoutService } from './logout.service';
import { IEmployeeAccess } from '../modals/tokent';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {

  private storage = inject(StorageService);
  private settingsService = inject(SettingsService);
  private logoutService = inject(LogoutService);

  /**
   * Rehydrates in-memory state from localStorage on app boot.
   * Returns true if a (still time-valid) session was restored,
   * false otherwise. Does NOT navigate — guards handle routing.
   */
  initializeApp(): Promise<boolean> {
    return new Promise((resolve) => {
      const accessToken = this.storage.get<string>('accessToken');
      const expiryTime = this.storage.get<number>('expiryTime');
      const user = this.storage.get<IEmployeeAccess>('employeeAccess');

      const now = Math.floor(Date.now() / 1000);
      const isValid = !!accessToken && !!expiryTime && expiryTime > now;

      if (!isValid) {
        this.storage.removeTokens();
        resolve(false);
        return;
      }

      if (user) {
        this.settingsService.setEmployeeAccess(user);
      }

      // Re-arm the auto-logout timer so a rehydrated session still
      // expires on schedule after a hard refresh, not just after a
      // fresh login.
      this.logoutService.startAutoLogout();

      resolve(true);
    });
  }
}
