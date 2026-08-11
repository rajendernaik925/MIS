import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const spinnerService = inject(SpinnerService);
  spinnerService.show();
  return next(req).pipe(
    // Previously called `delay(2000)` here without piping it into the
    // stream - it built an operator and threw it away, doing nothing.
    // Removed rather than reintroduced: a forced 2s delay on every
    // request (fast or slow) makes the whole app feel sluggish. If a
    // minimum visible-spinner time is actually wanted, apply delay()
    // to the source observable, e.g. `next(req).pipe(delay(200), finalize(...))`.
    finalize(() => spinnerService.hide()),
  );
};
