// import { inject, Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { StorageService } from './storage.service';
// import { IToastInterface } from '../modals/toast';
// import { ITokenData } from '../modals/tokent';

// @Injectable({
//   providedIn: 'root'
// })
// export class CoreService {

//   private showToast$: BehaviorSubject<IToastInterface> = new BehaviorSubject({type: '', message: ''});
//   showToast = this.showToast$.asObservable();
//   private storageService: StorageService = inject(StorageService);

//   displayToast(data = { type: "", message: "" }) {
//     this.showToast$.next(data);
//   }

//   setTokens(data: ITokenData) {
//     const tokens = {
//       accessToken: 'null',
//       refreshToken: 'null',
//       expiryTime: 'null',
//     };
//     if (data?.access) {
//       tokens.accessToken = data.access;
//     }
//     if (data?.refresh) {
//       tokens.refreshToken = data.refresh;
//     }
//     if (data?.expiry_time) {
//       tokens.expiryTime = `${data.expiry_time}`;
//     }
//     this.storageService.setTokens(tokens);
//   }
// }

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

  // Decode JWT payload safely
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Save tokens
  setTokens(jwtToken: string) {
    const decoded = this.decodeJwt(jwtToken);

    const tokens = {
      accessToken: jwtToken,
      expiryTime: decoded?.exp ? decoded.exp : null,
    };

    // Save to storage
    this.storageService.set('accessToken', tokens.accessToken);
    this.storageService.set('expiryTime', tokens.expiryTime);
  }
}
