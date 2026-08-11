import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { IToastInterface } from '../modals/toast';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private showToast$ = new BehaviorSubject<IToastInterface>({
    type: '',
    message: '',
  });

  showToast = this.showToast$.asObservable();

  private storageService = inject(StorageService);

  displayToast(data: IToastInterface) {
    this.showToast$.next(data);
  }

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // token: the raw JWT string from `res.token`
  setTokens(jwtToken: string): void {
    const decoded = this.decodeJwt(jwtToken);

    // decoded.exp is epoch SECONDS — matches what loginGuard/authGuard
    // compare against (Math.floor(Date.now() / 1000))
    this.storageService.set('accessToken', jwtToken);
    this.storageService.set('expiryTime', decoded?.exp ?? null);
  }
}