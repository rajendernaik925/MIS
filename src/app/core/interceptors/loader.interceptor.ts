import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';
import { delay, finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const spinnerService = inject(SpinnerService);
  const url = req.url;
  spinnerService.show();
  return next(req).pipe(
    finalize(() => {
      delay(2000);
      spinnerService.hide();
    }),
  );
};
