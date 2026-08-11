import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  set(key: string, value: any): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  removeTokens(): void {
    if (!this.isBrowser) return;
    // Explicit keys instead of clear() — safer if other data ever
    // gets stored in localStorage later.
    ['accessToken', 'expiryTime', 'employeeAccess'].forEach(k =>
      localStorage.removeItem(k)
    );
  }
}