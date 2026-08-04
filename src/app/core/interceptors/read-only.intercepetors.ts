import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const readOnlyInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const accessToken = storageService.get('accessToken');
  const expiryTime = storageService.get('expiryTime');
  // console.log("access token : ",accessToken)
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
  }

  const apiRequest = req.clone({ url: `${environment.apiUrl}${req.url}` });

  return next(apiRequest);
};
