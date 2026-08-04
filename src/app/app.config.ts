// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes), provideClientHydration(withEventReplay())
//   ]
// };

import {
  APP_INITIALIZER,
  ApplicationConfig,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

import { AppInitializerService } from './core/services/app-initializer.service';
import { CoreService } from './core/services/core.services';

import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { readOnlyInterceptor } from './core/interceptors/read-only.intercepetors';

export function initializeAppFactory(
  appInitializer: AppInitializerService,
  router: Router,
  coreService: CoreService
) {
  return () =>
    appInitializer
      .initializeApp()
      .then((res: any) => {
        if (!res) {
          localStorage.clear();
          router.navigate(['/dashboard']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.error(err);

        coreService.displayToast({
          type: 'err',
          message: err.message,
        });

        if (err.status === 401) {
          localStorage.clear();
          router.navigate(['/auth']);
        }
      });
}

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({
    //   eventCoalescing: true,
    // }),

    provideRouter(routes),

    provideAnimationsAsync(),

    provideHttpClient(
      withInterceptors([
        loaderInterceptor,
        readOnlyInterceptor,
      ])
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [
        AppInitializerService,
        Router,
        CoreService,
      ],
      multi: true,
    },
  ],
};