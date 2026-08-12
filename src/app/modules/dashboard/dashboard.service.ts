import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, from, Observable, switchMap, throwError } from "rxjs";
import { Router } from "@angular/router";
import { CoreService } from "../../core/services/core.services";
import { dashboardUrls } from "../../../api.constants";

@Injectable({
  providedIn: 'root'
})
export class dashboardService {

  private coreService: CoreService = inject(CoreService);
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('API Error:', error);

    if (error.status === 0 || error.status === 500) {
      this.router.navigate(['/server-error']);
      return throwError(() => 'Server error');
    }

    // When the request was made with responseType: 'blob' (file downloads),
    // a server error also comes back as a Blob, not JSON — error.error.message
    // would be undefined and the toast would silently show nothing useful.
    // Read the blob's text and parse it as JSON before falling back.
    if (error.error instanceof Blob) {
      return from(error.error.text()).pipe(
        switchMap((text) => {
          let errorMessage = 'Something went wrong';
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed?.message || errorMessage;
          } catch {
            if (text) errorMessage = text;
          }
          this.coreService.displayToast({ type: 'error', message: errorMessage });
          return throwError(() => errorMessage);
        }),
      );
    }

    let errorMessage = '';
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    this.coreService.displayToast({
      type: 'error',
      message: errorMessage || 'Something went wrong'
    });

    return throwError(() => errorMessage);
  };

  summary(formData: FormData): Observable<any> {
    return this.http.post<any>(`${dashboardUrls.summary}`, formData).pipe(
      catchError(this.handleError),
    );
  }
}