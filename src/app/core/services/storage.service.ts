// import { Injectable } from "@angular/core";
// import { projectName } from "../../api.constants";

// @Injectable({
//   providedIn: 'root'
// })

// export class StorageService {

//   setTokens(tokens: {accessToken: string; expiryTime: string}) {
//     localStorage.setItem(`${projectName}_accessToken`, tokens.accessToken);
//     // localStorage.setItem(`${projectName}_refreshToken`, tokens.refreshToken);
//     localStorage.setItem(`${projectName}_expiryTime`, tokens.expiryTime);
//   }

//   setValue(data: {key: string; value: string}) {
//     localStorage.setItem(`${projectName}_${data.key}`, `${data.value}`);
//   }

//   getValue(key: string) {
//     return localStorage.getItem(`${projectName}_${key}`);
//   }

//   removeItem(key: string) {
//     localStorage.removeItem(`${projectName}_${key}`);
//   }

//   removeTokens() {
//     const tokens = [`${projectName}_accessToken`, `${projectName}_refreshToken`, `${projectName}_expiryTime`];

//     tokens.forEach((token: string) => {
//       localStorage.removeItem(`${token}`);
//     });
//   }
// }


import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ---- TOKEN HANDLING ---- //
  setToken(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  getToken(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  removeToken(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clearAll(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  // ---- GENERIC STORAGE ---- //
  set(key: string, value: any): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  removeTokens(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }
}