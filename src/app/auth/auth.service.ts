import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { authUrls } from "../../api.constants";
import { catchError, EMPTY, Observable, of, throwError } from "rxjs";
import { CoreService } from "../core/services/core.services";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private coreService: CoreService = inject(CoreService);
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router)

  // private handleError = (error: HttpErrorResponse): Observable<never> => {
  //   let errorMessage = '';
  //   if (error.status === 0) {
  //     errorMessage = error.message;
  //   } else {
  //     errorMessage = error.error;
  //   }
  //   this.coreService?.displayToast({
  //     type: 'error',
  //     message: `${errorMessage}`,
  //   });
  //   return throwError(() => errorMessage);
  // }

  // private handleError = (error: HttpErrorResponse): Observable<any> => {

  //   /**
  //    * ✅ CASE: Status 200 but Angular failed JSON parsing
  //    * Treat as SUCCESS
  //    * ❌ DO NOT show toast
  //    */
  //   if (error.status === 200) {

  //     if (typeof error.error === 'string') {
  //       return of(error.error);
  //     }

  //     if (error.error instanceof Blob) {
  //       return new Observable(observer => {
  //         error.error.text().then((text: string) => {
  //           observer.next(text);
  //           observer.complete();
  //         });
  //       });
  //     }

  //     return of(error.error);
  //   }

  //   /**
  //    * 🚨 SERVICE UNAVAILABLE (NO INTERNET / SERVER DOWN)
  //    */
  //   if (error.status === 0) {

  //     // Redirect to error page
  //     this.router.navigate(['/server-error']);

  //     // Stop further handling
  //     return EMPTY;
  //   }

  //   /**
  //    * ❌ REAL ERROR HANDLING BELOW
  //    */
  //   let errorMessage = 'Something went wrong. Please try again';

  //   if (typeof error.error === 'string') {
  //     errorMessage = error.error;
  //   } else if (error.error?.message) {
  //     errorMessage = error.error.message;
  //   } else if (error.message) {
  //     errorMessage = error.message;
  //   }

  //   this.coreService.displayToast({
  //     type: 'error',
  //     message: errorMessage
  //   });

  //   return throwError(() => error);
  // };

 private handleError = (error: HttpErrorResponse): Observable<never> => {

  console.error('API Error:', error);

  let errorMessage = '';

  // Network / Server error
  if (error.status === 0 || error.status === 500) {

    this.router.navigate(['/server-error']);

    return throwError(() => 'Server error');
  }

  // Backend error response
  if (error.error) {

    if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    else if (error.error.message) {
      errorMessage = error.error.message;
    }
    else if (error.message) {
      errorMessage = error.message;
    }
  }

  this.coreService.displayToast({
    type: 'error',
    message: errorMessage  || 'Something went wrong'
  });

  return throwError(() => errorMessage);
};

  Login(data: any = {}): Observable<any> {
    return this.http.post<any>(`${authUrls.login}`, data).pipe(
      catchError(this.handleError),
    );
  }

}
